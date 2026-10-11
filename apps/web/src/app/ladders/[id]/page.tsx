import type { Metadata } from 'next'
import { Game } from '~/components/game'
import { getLadder } from '~/lib/ladder'

export async function generateMetadata({ params }: PageProps<'/ladders/[id]'>): Promise<Metadata> {
  const { title } = await getLadder((await params).id)
  return { title, openGraph: { title, siteName: 'rungs', type: 'website' } }
}

// Any ladder whose day has come. The draft is loaded from the player's saved
// progress.
export default async function Play({ params }: PageProps<'/ladders/[id]'>) {
  const { id, title, date, total } = await getLadder((await params).id)
  return <Game key={id} ladder={{ id, title, date, total }} />
}
