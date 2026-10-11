import { getSolution } from '~/lib/ladder'
import { card } from '~/lib/og'

export const alt = 'a solution on rungs, a writing game'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The ladder and who solved it, never the text: a link preview can't ask
// before giving a ladder away.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { title, name, words } = await getSolution((await params).id)
  return card(title, `a solution by ${name}, in ${words} words.`)
}
