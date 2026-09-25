'use client'

import Link from 'next/link'
import { authClient } from '~/lib/auth-client'
import { Calendar, Info, Person } from './icons'

export const iconButton =
  'text-muted hover:text-ink grid size-8 place-items-center rounded-full transition-colors active:scale-95'

// History, this ladder's about page and the account, in that order. Signed in,
// the account button shows the player's initial instead of the silhouette.
export function Nav({ ladder }: { ladder?: string }) {
  const { data } = authClient.useSession()
  const initial = (data?.user.name || data?.user.email || '').charAt(0).toUpperCase()

  return (
    <>
      <Link href="/ladders" aria-label="past ladders" className={iconButton}>
        <Calendar className="size-4" />
      </Link>
      {ladder ? (
        <Link
          href={`/ladders/${ladder}/about`}
          aria-label="about this ladder"
          className={iconButton}
        >
          <Info className="size-4" />
        </Link>
      ) : null}
      <Link href="/account" aria-label={data ? 'your account' : 'sign in'} className={iconButton}>
        {initial ? (
          <span className="bg-hue text-ground grid size-6 place-items-center rounded-full text-[12px] font-semibold">
            {initial}
          </span>
        ) : (
          <Person className="size-4" />
        )}
      </Link>
    </>
  )
}
