'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type LadderInfo, type RuleResult, type Score } from './api'
import { openSession } from './auth-client'
import { localDraft } from './storage'
import { track } from './track'

type Saved = { text: string; unlocked: number; best: number | null }
const EMPTY: Saved = { text: '', unlocked: 1, best: null }

// How a rule reads to the player. Every rule before the newest one must have
// held at some point (that is how the next one arrived), so an earlier rule
// that fails is always one the player has just broken.
export type RuleState = 'new' | 'open' | 'holds' | 'broken'
export type RuleView = RuleResult & { index: number; state: RuleState }

const TYPING_PAUSE = 450
// Long enough for the new rule to land on screen before it gets judged.
const REVEAL_BEAT = 1100
const LOAD_RETRY = 3000

// What one judge call answers: the same trimmed text at the same unlock count
// always scores the same.
const judgeKey = (text: string, unlocked: number) => `${unlocked}:${text.trim()}`

// The last answer per ladder, kept across page changes, so reopening a ladder
// or pausing on unchanged text doesn't pay for a call whose answer is known.
// It only counts while nothing newer has been sent.
const lastScore = new Map<string, { key: string; score: Score }>()

export function useLadder(ladder: LadderInfo) {
  const [saved, setSaved] = useState<Saved | null>(null)
  const [score, setScore] = useState<Score | null>(null)
  const [fresh, setFresh] = useState<Score['revealed']>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The finale plays once per clear, not on every keystroke while it holds.
  const [celebrate, setCelebrate] = useState(false)
  const wasCleared = useRef(false)
  // Counts reveals. Each one judges the draft again against the new rule.
  const [reveals, setReveals] = useState(0)

  const controller = useRef<AbortController | null>(null)
  // The one judge waiting to go, after a typing pause or a reveal. Null once
  // it has gone.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef<Saved | null>(null)
  // The last draft sent to the judge, which the server saved.
  const sent = useRef<string | null>(null)

  // The server saves the draft each time it's judged, so this is just state.
  const commit = useCallback((next: Saved) => {
    latest.current = next
    setSaved(next)
  }, [])

  const apply = useCallback(
    (result: Score) => {
      setScore(result)
      setError(null)
      const current = latest.current!

      // The server's count wins: it never lets the client past what the
      // judge has revealed.
      if (result.unlocked !== current.unlocked) commit({ ...current, unlocked: result.unlocked })

      if (result.revealed) {
        setFresh(result.revealed)
        navigator.vibrate?.(12)
        setReveals((n) => n + 1)
        track('rule-unlocked', { ladder: ladder.id, rule: result.unlocked, total: ladder.total })
      } else {
        setFresh(null)
      }

      if (result.cleared && !wasCleared.current) setCelebrate(true)
      wasCleared.current = result.cleared

      // Counted where the best changes, since the finale also plays again when
      // a cleared ladder is reopened.
      if (result.cleared && (current.best == null || result.words < current.best)) {
        track('ladder-cleared', {
          ladder: ladder.id,
          words: result.words,
          first: current.best == null,
        })
        commit({ ...latest.current!, best: result.words })
      }
    },
    [commit, ladder.id, ladder.total],
  )

  // `keepalive` lets the request finish after the page is gone.
  const judge = useCallback(
    async (text: string, unlocked: number, keepalive = false) => {
      const key = judgeKey(text, unlocked)
      const known = lastScore.get(ladder.id)
      sent.current = key
      if (known?.key === key) return apply(known.score)
      lastScore.delete(ladder.id)

      controller.current?.abort()
      const ctl = new AbortController()
      controller.current = ctl
      setPending(true)

      const post = () =>
        api.ladders[':id'].score.$post(
          { param: { id: ladder.id }, json: { text, unlocked } },
          { init: { signal: ctl.signal, keepalive } },
        )

      try {
        let res = await post()
        // No session yet: this is the player's first judged draft.
        if (res.status === 401) {
          if (!(await openSession())) {
            if (!ctl.signal.aborted) {
              setError('too many new players from your network. give it a minute.')
            }
            return
          }
          res = await post()
        }
        // A newer judge has started, and only its answer counts.
        if (ctl.signal.aborted) return
        if (res.status === 401) {
          return setError('this browser is blocking cookies, and the game needs one to judge.')
        }
        if (res.status === 429) {
          track('judge-error', { ladder: ladder.id, kind: 'rate-limit' })
          return setError('too many checks in a row. give it a minute.')
        }
        // The judge's daily budget is spent. 503 isn't among the route's typed
        // responses.
        if ((res.status as number) === 503) {
          track('judge-error', { ladder: ladder.id, kind: 'budget' })
          return setError('the judge is out of checks for today. it’s back at midnight utc.')
        }
        if (!res.ok) throw new Error(String(res.status))
        const result = await res.json()
        if (ctl.signal.aborted) return
        lastScore.set(ladder.id, { key, score: result })
        apply(result)
      } catch {
        if (!ctl.signal.aborted) {
          track('judge-error', { ladder: ladder.id, kind: 'network' })
          setError('couldn’t reach the judge. keep writing, it’ll catch up.')
        }
      } finally {
        if (controller.current === ctl) setPending(false)
      }
    },
    [apply, ladder.id],
  )

  // Replaces whatever judge was waiting, and always judges the draft as it is
  // when the wait ends.
  const judgeLater = useCallback(
    (ms: number) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        void judge(latest.current!.text, latest.current!.unlocked)
      }, ms)
    },
    [judge],
  )

  // A draft still waiting out the typing pause is sent now, so leaving the
  // page doesn't drop the last words.
  const flush = useCallback(() => {
    if (!timer.current) return
    clearTimeout(timer.current)
    timer.current = null
    const { text, unlocked } = latest.current!
    if (judgeKey(text, unlocked) !== sent.current) void judge(text, unlocked, true)
  }, [judge])

  useEffect(() => {
    let live = true
    let retry: ReturnType<typeof setTimeout> | undefined
    const load = async () => {
      try {
        const res = await api.me.progress[':id'].$get({ param: { id: ladder.id } })
        if (!res.ok) throw new Error(String(res.status))
        const server = await res.json()
        if (!live) return
        const initial = server ?? { ...EMPTY, ...localDraft(ladder.id) }
        setError(null)
        commit(initial)
        void judge(initial.text, initial.unlocked)
      } catch {
        // Not the same as having no draft: opening empty would save over it.
        if (!live) return
        // Once per visit, not once per retry.
        if (!retry) track('judge-error', { ladder: ladder.id, kind: 'load' })
        setError('couldn’t load your draft. trying again.')
        retry = setTimeout(load, LOAD_RETRY)
      }
    }
    void load()
    return () => {
      live = false
      clearTimeout(retry)
    }
  }, [commit, judge, ladder.id])

  useEffect(() => {
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flush])

  useEffect(() => {
    if (reveals) judgeLater(REVEAL_BEAT)
  }, [reveals, judgeLater])

  const write = useCallback(
    (text: string) => {
      if (!latest.current) return
      commit({ ...latest.current, text })
      judgeLater(TYPING_PAUSE)
    },
    [commit, judgeLater],
  )

  const restart = useCallback(() => {
    if (!latest.current) return
    if (latest.current.text.trim() && !confirm('start over? this clears your draft.')) return
    track('restart', { ladder: ladder.id, rule: latest.current.unlocked })
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    commit({ ...latest.current, text: '', unlocked: 1 })
    setFresh(null)
    setScore(null)
    setCelebrate(false)
    wasCleared.current = false
    void judge('', 1)
  }, [commit, judge, ladder.id])

  const rules: RuleView[] = (score?.rules ?? []).map((rule, index, all) => ({
    ...rule,
    index,
    state: rule.satisfied ? 'holds' : index < all.length - 1 ? 'broken' : 'open',
  }))

  if (fresh && !rules.some((r) => r.id === fresh.id)) {
    rules.push({ ...fresh, index: rules.length, satisfied: false, progress: 0, state: 'new' })
  }

  return {
    ready: saved != null,
    text: saved?.text ?? '',
    best: saved?.best ?? null,
    total: ladder.total,
    words: score?.words ?? 0,
    degenerate: score?.degenerate ?? false,
    celebrate,
    rules,
    pending,
    error,
    write,
    restart,
    dismiss: () => setCelebrate(false),
  }
}
