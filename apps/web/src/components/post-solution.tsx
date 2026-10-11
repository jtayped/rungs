'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '~/lib/api'
import { useAccount } from '~/lib/auth-client'
import { track } from '~/lib/track'

type Status =
  | { kind: 'idle' }
  | { kind: 'posting' }
  | { kind: 'posted'; id: number; words: number }
  | { kind: 'error'; message: string }

const field =
  'bg-sheet ring-hairline focus:ring-hue h-14 w-full rounded-full px-6 text-[17px] ring-1 outline-none'
const primary =
  'bg-ink text-ground flex h-14 w-full items-center justify-center rounded-full px-8 text-[17px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-60 sm:w-auto'

type Mine = { text: string; comment: string | null; words: number }

// Posting is the one thing that needs an account. Signed out, the button goes
// to sign-in and comes back here. Signing in carries the draft over to the
// account, so the finale plays again on return.
export function PostSolution({ ladder, text }: { ladder: string; text: string }) {
  const { data, isPending } = useAccount()
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [mine, setMine] = useState<Mine | null>(null)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')

  // Keyed on the user's id: the session object is new every time the tab
  // regains focus, and refilling the comment then would undo an edit.
  const userId = data?.user.id
  useEffect(() => {
    if (!userId) return
    void api.ladders[':id'].solutions.mine
      .$get({ param: { id: ladder } })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        setMine(m)
        if (m?.comment) setComment(m.comment)
      })
      .catch(() => {})
  }, [userId, ladder])

  if (isPending) return <div className="mt-8 h-14" />

  if (!data) {
    return (
      <Link href={`/account?next=/ladders/${ladder}`} className={`${primary} mt-8`}>
        sign in to post it
      </Link>
    )
  }

  if (status.kind === 'posted') {
    return (
      <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-[15px]">
        <span>posted, {status.words} words.</span>
        <Link
          href={`/solutions/${status.id}`}
          className="font-semibold underline underline-offset-4"
        >
          see yours
        </Link>
        <Link
          href={`/ladders/${ladder}/about`}
          className="font-semibold underline underline-offset-4"
        >
          see everyone’s
        </Link>
      </p>
    )
  }

  const needsName = !data.user.name
  const post = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ kind: 'posting' })
    const res = await api.ladders[':id'].solutions
      .$post({
        param: { id: ladder },
        json: { text, comment, ...(needsName ? { name } : {}) },
      })
      .catch(() => null)
    if (!res)
      return setStatus({ kind: 'error', message: 'couldn’t post that. try again in a moment.' })
    if (res.status === 201) {
      const { id, words } = await res.json()
      track('solution-posted', { ladder, words, replaced: mine != null })
      setMine({ text: text.trim(), comment: comment.trim() || null, words })
      return setStatus({ kind: 'posted', id, words })
    }
    // Scores near a threshold can wobble between calls. Rare, and the fix is
    // the same as any broken rule: keep editing.
    if (res.status === 422) {
      return setStatus({
        kind: 'error',
        message: 'the judge read it again and a rule didn’t hold. nudge it and try once more.',
      })
    }
    // The api's own refusals carry a message; a failed check on the body doesn't.
    const body: unknown = await res.json().catch(() => null)
    const said = (body as { error?: unknown } | null)?.error
    const message =
      res.status === 400
        ? typeof said === 'string'
          ? said
          : 'names are up to 40 characters, and comments are one line with no links.'
        : (res.status as number) === 503
          ? 'the judge is out of checks for today. it’s back at midnight utc.'
          : 'couldn’t post that. try again in a moment.'
    setStatus({ kind: 'error', message })
  }

  const same = mine?.text === text.trim() && (mine.comment ?? '') === comment.trim()
  return (
    <form onSubmit={post} className="mt-8 flex flex-col gap-3">
      {needsName ? (
        <input
          required
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="a name to post under"
          aria-label="a name to post under"
          className={field}
        />
      ) : null}
      <input
        maxLength={280}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="add a comment, if you like"
        aria-label="a comment on your solution"
        className={field}
      />
      <button
        type="submit"
        disabled={status.kind === 'posting' || same}
        className={`${primary} sm:self-start`}
      >
        {status.kind === 'posting'
          ? 'judging…'
          : same
            ? 'posted'
            : mine
              ? `replace your ${mine.words}-word post`
              : 'post your solution'}
      </button>
      {status.kind === 'error' ? (
        <p role="alert" className="text-muted px-2 text-[13px]">
          {status.message}
        </p>
      ) : null}
    </form>
  )
}
