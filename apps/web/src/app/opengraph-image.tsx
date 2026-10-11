import { card } from '~/lib/og'

export const alt = 'rungs, a writing game: write until the rule holds.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return card('write until the rule holds.', 'a writing game.')
}
