import type { Metadata } from 'next'
import { Game } from '~/components/game'
import { Page } from '~/components/page'
import { getToday } from '~/lib/ladder'

// Today's ladder changes at midnight UTC, so this can't be prerendered.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const ladder = await getToday()
  const title = ladder?.title ?? 'rungs'
  // Replaces the layout's openGraph wholesale, so it carries everything.
  return { title, openGraph: { title, siteName: 'rungs', type: 'website' } }
}

export default async function Today() {
  const ladder = await getToday()
  if (!ladder) {
    return (
      <Page back={{ href: '/ladders', label: 'past ladders' }} title="nothing yet.">
        <p className="text-muted mt-6 text-[19px] leading-[1.45]">
          the first ladder hasn’t gone up. come back tomorrow.
        </p>
      </Page>
    )
  }
  return <Game key={ladder.id} ladder={ladder} />
}
