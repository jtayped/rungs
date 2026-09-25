'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '~/lib/api'
import { authClient } from '~/lib/auth-client'

type Status =
  | { kind: 'idle' }
  | { kind: 'posting' }
  | { kind: 'posted'; words: number }
  | { kind: 'error'; message: string }

const primary =
  'bg-hue text-ground flex h-14 w-full items-center justify-center rounded-full px-8 text-[17px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-60 sm:w-auto'

// Posting is the one thing that needs an account. Signed out, the button goes
// to sign-in and comes back here; the draft is in localStorage, so the finale
// plays again on return.
export function PostSolution({ ladder, text }: { ladder: string; text: string }) {
  const { data, isPending } = authClient.useSession()
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [mine, setMine] = useState<{ text: string; words: number } | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!data) return
    void api.ladders[':id'].solutions.mine
      .$get({ param: { id: ladder } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setMine)
  }, [data, ladder])

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
          href={`/ladders/${ladder}/about`}
          className="text-hue font-semibold underline-offset-4 hover:underline"
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
    const res = await api.ladders[':id'].solutions.$post({
      param: { id: ladder },
      json: { text, ...(needsName ? { name } : {}) },
    })
    if (res.status === 201) {
      const { words } = await res.json()
      setMine({ text: text.trim(), words })
      return setStatus({ kind: 'posted', words })
    }
    // Scores near a threshold can wobble between calls. Rare, and the fix is
    // the same as any broken rule: keep editing.
    const message =
      res.status === 422
        ? 'the judge read it again and a rule didn’t hold. nudge it and try once more.'
        : 'couldn’t post that. try again in a moment.'
    setStatus({ kind: 'error', message })
  }

  const same = mine?.text === text.trim()
  return (
    <form onSubmit={post} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      {needsName ? (
        <input
          required
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="a name to post under"
          aria-label="a name to post under"
          className="bg-sheet ring-hairline focus:ring-hue h-14 rounded-full px-6 text-[17px] ring-1 outline-none sm:flex-1"
        />
      ) : null}
      <button type="submit" disabled={status.kind === 'posting' || same} className={primary}>
        {status.kind === 'posting'
          ? 'judging…'
          : same
            ? 'posted'
            : mine
              ? `replace your ${mine.words}-word post`
              : 'post your solution'}
      </button>
      {status.kind === 'error' ? (
        <p className="text-muted px-2 text-[13px]">{status.message}</p>
      ) : null}
    </form>
  )
}
