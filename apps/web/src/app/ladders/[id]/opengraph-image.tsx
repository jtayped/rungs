import { getLadder } from '~/lib/ladder'
import { card } from '~/lib/og'

export const alt = 'a ladder on rungs, a writing game'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Covers the about page too, since it sits under this segment. The line under
// the title is rule 1, which the home page already shows.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { title, first } = await getLadder((await params).id)
  return card(title, first)
}
