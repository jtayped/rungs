// One colour per rule, walking the spectrum as the ladder climbs, and cycling
// for ladders longer than the palette. Used for
// fills, rings and the aura, never for body text: yellow on white fails.
export const HUES = [
  '#0a84ff', // blue
  '#5e5ce6', // indigo
  '#bf5af2', // purple
  '#ff375f', // pink
  '#ff9f0a', // orange
  '#ffcc00', // yellow
  '#30d158', // green
  '#00c7be', // teal
] as const

export const hue = (index: number) => HUES[((index % HUES.length) + HUES.length) % HUES.length]!

export const SPECTRUM = [HUES[0], HUES[2], HUES[4]]
