'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type LadderInfo, type RuleResult, type Score } from './api'
import { openSession } from './auth-client'
import { localDraft } from './storage'

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

export function useLadder(ladder: LadderInfo) {
  const [saved, setSaved] = useState<Saved | null>(null)
  const [score, setScore] = useState<Score | null>(null)
  const [fresh, setFresh] = useState<Score['revealed']>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The finale plays once per clear, not on every keystroke while it holds.
  const [celebrate, setCelebrate] = useState(false)
  const wasCleared = useRef(false)
  // After a reveal, the same text is judged again against the new rule.
  const [followUp, setFollowUp] = useState<{ text: string; unlocked: number } | null>(null)

  const controller = useRef<AbortController | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef<Saved | null>(null)

  // The server saves the draft each time it's judged, so this is just state.
  const commit = useCallback((next: Saved) => {
    latest.current = next
    setSaved(next)
  }, [])

  const judge = useCallback(
    async (text: string, unlocked: number) => {
      controller.current?.abort()
      const ctl = new AbortController()
      controller.current = ctl
      setPending(true)

      const post = () =>
        api.ladders[':id'].score.$post(
          { param: { id: ladder.id }, json: { text, unlocked } },
          { init: { signal: ctl.signal } },
        )

      try {
        let res = await post()
        // No session yet: this is the player's first judged draft.
        if (res.status === 401) {
          if (!(await openSession())) {
            return setError('too many new players from your network. give it a minute.')
          }
          res = await post()
          if (res.status === 401) {
            return setError('this browser is blocking cookies, and the game needs one to judge.')
          }
        }
        if (res.status === 429) return setError('too many checks in a row. give it a minute.')
        if (!res.ok) throw new Error(String(res.status))
        const result = await res.json()
        if (ctl.signal.aborted) return

        setScore(result)
        setError(null)
        const current = latest.current!

        // The server's count wins: it never lets the client past what the
        // judge has revealed.
        if (result.unlocked !== current.unlocked) commit({ ...current, unlocked: result.unlocked })

        if (result.revealed) {
          setFresh(result.revealed)
          navigator.vibrate?.(12)
          setFollowUp({ text, unlocked: result.unlocked })
        } else {
          setFresh(null)
        }

        if (result.cleared && !wasCleared.current) setCelebrate(true)
        wasCleared.current = result.cleared

        if (result.cleared && (current.best == null || result.words < current.best)) {
          commit({ ...latest.current!, best: result.words })
        }
      } catch {
        if (!ctl.signal.aborted) setError('couldn’t reach the judge. keep writing, it’ll catch up.')
      } finally {
        if (controller.current === ctl) setPending(false)
      }
    },
    [commit, ladder.id],
  )

  useEffect(() => {
    let live = true
    void api.me.progress[':id']
      .$get({ param: { id: ladder.id } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((server) => {
        if (!live) return
        const initial = server ?? { ...EMPTY, ...localDraft(ladder.id) }
        commit(initial)
        void judge(initial.text, initial.unlocked)
      })
    return () => {
      live = false
      controller.current?.abort()
      if (timer.current) clearTimeout(timer.current)
    }
  }, [commit, judge, ladder.id])

  useEffect(() => {
    if (!followUp) return
    // Held in `timer` too, so typing during the beat replaces it.
    const t = setTimeout(() => void judge(followUp.text, followUp.unlocked), REVEAL_BEAT)
    timer.current = t
    return () => clearTimeout(t)
  }, [followUp, judge])

  const write = useCallback(
    (text: string) => {
      const current = latest.current
      if (!current) return
      commit({ ...current, text })
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => void judge(text, latest.current!.unlocked), TYPING_PAUSE)
    },
    [commit, judge],
  )

  const restart = useCallback(() => {
    if (!latest.current) return
    if (timer.current) clearTimeout(timer.current)
    commit({ ...latest.current, text: '', unlocked: 1 })
    setFresh(null)
    setScore(null)
    setCelebrate(false)
    wasCleared.current = false
    void judge('', 1)
  }, [commit, judge])

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
