import type { Metadata } from 'next'
import { Game } from '~/components/game'
import { getLadder } from '~/lib/ladder'

// The ladder is whatever the API is serving right now, so this can't be
// prerendered at build time.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getLadder()
  // Replaces the layout's openGraph wholesale, so it carries everything.
  return { title, openGraph: { title, siteName: 'rungs', type: 'website' } }
}

export default async function Page() {
  const ladder = await getLadder()
  return <Game key={ladder.id} ladder={ladder} />
}
