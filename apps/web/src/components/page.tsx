import Link from 'next/link'
import { Back } from './icons'

// The plain shell for everything that isn't the game: a back link, a title and
// a single readable column.
export function Page({
  back = { href: '/', label: 'today' },
  eyebrow,
  title,
  children,
}: {
  back?: { href: string; label: string }
  eyebrow?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto min-h-svh max-w-2xl px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-8 sm:pt-8">
      <Link
        href={back.href}
        className="text-muted hover:text-ink -ml-1.5 inline-flex h-8 items-center gap-1 text-[15px] font-medium transition-colors"
      >
        <Back className="size-4" />
        {back.label}
      </Link>
      {eyebrow ? <p className="text-muted mt-8 text-[15px] font-medium">{eyebrow}</p> : null}
      <h1
        className={`font-display text-[clamp(2.5rem,9vw,4rem)] leading-[0.95] font-semibold tracking-[-0.045em] ${eyebrow ? 'mt-2' : 'mt-8'}`}
      >
        {title}
      </h1>
      {children}
    </main>
  )
}

// '2026-09-25' → 'sep 25', matching the lowercase voice everywhere else.
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .toLowerCase()
}
