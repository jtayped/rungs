import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate, Page } from '~/components/page'
import { listLadders } from '~/lib/ladder'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'past ladders' }

export default async function Ladders() {
  const ladders = await listLadders()
  return (
    <Page title="past ladders">
      <ol className="bg-sheet ring-hairline mt-10 overflow-hidden rounded-[26px] ring-1 backdrop-blur-2xl">
        {ladders.map((l, i) => (
          <li
            key={l.id}
            className="border-hairline flex items-center gap-4 border-b px-5 py-4 last:border-b-0"
          >
            <Link href={i === 0 ? '/' : `/ladders/${l.id}`} className="min-w-0 flex-1">
              <p className="text-muted text-[13px] font-medium tabular-nums">
                {i === 0 ? 'today' : formatDate(l.date)}
              </p>
              <p className="mt-0.5 truncate text-[17px] font-semibold tracking-[-0.015em]">
                {l.title}
              </p>
              <p className="text-muted mt-0.5 text-[13px]">
                {l.total} rules · {l.solutions} {l.solutions === 1 ? 'solution' : 'solutions'}
              </p>
            </Link>
            <Link
              href={`/ladders/${l.id}/about`}
              className="text-muted hover:text-ink ring-hairline h-9 shrink-0 rounded-full px-4 text-[14px] leading-9 font-medium ring-1 transition-colors"
            >
              about
            </Link>
          </li>
        ))}
      </ol>
      {!ladders.length ? <p className="text-muted mt-6 text-[17px]">none yet.</p> : null}
    </Page>
  )
}
