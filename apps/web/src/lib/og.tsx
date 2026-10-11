import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { hue } from './palette'

const font = (weight: number) => readFile(join(process.cwd(), `assets/Geist-${weight}.ttf`))

// Satori has no blur filter, so each field is a radial gradient eased like a
// blurred disc, fading to the same colour at zero alpha. Fading to
// `transparent` would pass through grey. Satori also crops a gradient to the
// card's size, so no field is wider or taller than 1200×630.
const glow = (color: string) =>
  `radial-gradient(ellipse closest-side, ${color}6b 0%, ${color}5a 30%, ${color}30 55%, ${color}10 78%, ${color}00 100%)`

// Neighbouring hues (blue, indigo, purple), large enough to overlap, so the
// card reads as one wash with no dark gaps or muddy blends between fields.
const FIELDS = [
  { left: -300, top: -260, width: 1200, rule: 0 },
  { left: 500, top: -140, width: 1100, rule: 2 },
  { left: -40, top: 190, width: 1200, rule: 1 },
]

// Satori leaves some gaps between words too wide when it wraps text itself, so
// lines are broken here and each one is set as a single unbreakable run.
// shortcut: breaks by character count, not measured width, so a line heavy in
// wide letters could run past the padding; measure glyphs if a title ever does.
function lines(text: string, perLine: number) {
  const out: string[] = []
  for (const word of text.split(' ')) {
    const last = out.length - 1
    if (last >= 0 && out[last]!.length + 1 + word.length <= perLine) out[last] += ` ${word}`
    else out.push(word)
  }
  // A lone word on the last line looks stranded, so it takes one from above.
  const [above, end] = out.slice(-2)
  if (above && end && !end.includes(' ') && above.includes(' ')) {
    const cut = above.lastIndexOf(' ')
    out.splice(-2, 2, above.slice(0, cut), `${above.slice(cut + 1)} ${end}`)
  }
  return out.map((l, i) => <div key={i}>{l.replaceAll(' ', '\u00a0')}</div>)
}

// The 1200×630 link preview every page shares: the aura, the mark, and the
// page's title over one quieter line.
export async function card(title: string, line: string) {
  const [regular, semibold] = await Promise.all([font(400), font(600)])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: '#000',
        color: '#f5f5f7',
        fontFamily: 'Geist',
        position: 'relative',
      }}
    >
      {FIELDS.map((f) => (
        <div
          key={f.rule}
          style={{
            position: 'absolute',
            left: f.left,
            top: f.top,
            width: f.width,
            height: 630,
            backgroundImage: glow(hue(f.rule)),
          }}
        />
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(135deg, ${hue(0)}, ${hue(2)} 45%, ${hue(4)})`,
          }}
        >
          <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff' }} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>rungs</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 104,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {lines(title, 20)}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 36,
            color: '#98989d',
            lineHeight: 1.3,
          }}
        >
          {lines(line, 58)}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: regular, weight: 400, style: 'normal' },
        { name: 'Geist', data: semibold, weight: 600, style: 'normal' },
      ],
      headers: { 'cache-control': 'public, max-age=3600' },
    },
  )
}
