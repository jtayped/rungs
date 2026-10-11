'use client'

import Link from 'next/link'
import { useAccount } from '~/lib/auth-client'
import { Bubble, Grid, Info, Person } from './icons'

export const iconButton =
  'group text-muted hover:text-ink relative grid size-8 place-items-center rounded-full transition-colors active:scale-95'

// An icon button's name, shown under it on hover or keyboard focus. Screen
// readers get the same name from the button's aria-label. The last button in
// a row sits at the page's edge, so its name lines up on the right instead.
export function Tip({ children }: { children: string }) {
  return (
    <span
      aria-hidden
      className="bg-ink text-ground pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap opacity-0 transition-opacity group-last:right-0 group-last:left-auto group-last:translate-x-0 group-hover:opacity-100 group-hover:delay-200 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  )
}

// Every ladder, everyone's solutions, this ladder's about page and the
// account, in that order. Signed in, the account button shows the player's
// initial instead of the silhouette.
export function Nav({ ladder }: { ladder?: string }) {
  const { data } = useAccount()
  const initial = (data?.user.name || data?.user.email || '').charAt(0).toUpperCase()
  const account = data ? 'your account' : 'sign in'

  return (
    <>
      <Link href="/" aria-label="all ladders" className={iconButton}>
        <Grid className="size-4" />
        <Tip>all ladders</Tip>
      </Link>
      <Link href="/solutions" aria-label="everyone’s solutions" className={iconButton}>
        <Bubble className="size-4" />
        <Tip>everyone’s solutions</Tip>
      </Link>
      {ladder ? (
        <Link
          href={`/ladders/${ladder}/about`}
          aria-label="about this ladder"
          className={iconButton}
        >
          <Info className="size-4" />
          <Tip>about this ladder</Tip>
        </Link>
      ) : null}
      <Link href="/account" aria-label={account} className={iconButton}>
        {initial ? (
          <span className="bg-hue text-ground grid size-6 place-items-center rounded-full text-[12px] font-semibold">
            {initial}
          </span>
        ) : (
          <Person className="size-4" />
        )}
        <Tip>{account}</Tip>
      </Link>
    </>
  )
}
