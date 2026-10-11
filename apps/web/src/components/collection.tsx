'use client'

import Link from 'next/link'
import type { Collection as Data } from '~/lib/api'
import { hue } from '~/lib/palette'
import { useProgress } from '~/lib/progress'
import { Check } from './icons'
import { formatDate } from './page'

const card = 'bg-sheet ring-hairline rounded-[26px] p-5 ring-1 backdrop-blur-2xl sm:p-6'

// Every ladder that's out, newest first, marked with how far this player got.
// Ladders that aren't out yet follow, blurred, soonest first.
export function Collection({ ladders, upcoming }: Data) {
  const progress = useProgress()

  return (
    <>
      <ol className="mt-10 grid gap-3 sm:grid-cols-2">
        {ladders.map((l, i) => {
          const p = progress[l.id]
          return (
            <li key={l.id} style={{ '--hue': hue(i) } as React.CSSProperties}>
              <Link
                href={`/ladders/${l.id}`}
                className={`${card} flex h-full flex-col transition-transform active:scale-[0.98]`}
              >
                <p className="flex items-center gap-2 text-[13px] font-medium">
                  <span className="bg-hue size-2 rounded-full" />
                  {p?.best != null ? (
                    <span className="text-hue inline-flex items-center gap-1">
                      <Check className="size-3.5" />
                      cleared in {p.best} words
                    </span>
                  ) : p?.started ? (
                    <span className="text-muted">
                      on rule {p.unlocked} of {l.total}
                    </span>
                  ) : (
                    <span className="text-muted">{l.total} rules</span>
                  )}
                </p>
                <p className="mt-3 text-[20px] leading-tight font-semibold tracking-[-0.02em]">
                  {l.title}
                </p>
                <p className="text-muted mt-1.5 text-[15px] leading-snug">{l.first}</p>
                <p className="text-muted mt-auto pt-4 text-[13px] tabular-nums">
                  {l.solutions} {l.solutions === 1 ? 'solution' : 'solutions'} posted
                </p>
              </Link>
            </li>
          )
        })}
      </ol>

      {upcoming.length ? (
        <section aria-label="coming up" className="mt-12">
          <h2 className="text-muted mb-3 px-1 text-[13px] font-medium">coming up</h2>
          <ol className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((u, i) => (
              <li key={`${u.date}-${i}`} className={card}>
                {/* The server only sends the date and size, so this is a stand-in. */}
                <div aria-hidden className="blur-sm">
                  <div className="bg-hairline h-5 w-2/3 rounded-full" />
                  <div className="bg-hairline mt-3 h-3.5 w-full rounded-full" />
                  <div className="bg-hairline mt-2 h-3.5 w-1/2 rounded-full" />
                </div>
                <p className="mt-5 text-[13px] font-medium">
                  out {formatDate(u.date)}
                  <span className="text-muted"> · {u.total} rules</span>
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  )
}
