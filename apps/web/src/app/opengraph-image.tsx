import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { getLadder } from '~/lib/ladder'
import { hue } from '~/lib/palette'

// Drawn per request from whatever ladder the API is serving, so a new ladder
// gets a new card without anyone touching this file.
export const dynamic = 'force-dynamic'
export const alt = 'rungs, a writing game'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const font = (weight: number) => readFile(join(process.cwd(), `assets/Geist-${weight}.ttf`))

// Satori has no blur filter, so the aura is radial gradients that fade to the
// same colour at zero alpha. Fading to `transparent` would pass through grey.
// Satori also crops a gradient to 630px, so no field is taller than the card.
const glow = (color: string) =>
  `radial-gradient(ellipse closest-side, ${color}99 0%, ${color}00 100%)`

const FIELDS = [
  { left: -360, top: -330, rule: 0 },
  { left: 560, top: -120, rule: 2 },
  { left: 40, top: 330, rule: 4 },
]

export default async function Image() {
  const [regular, semibold, ladder] = await Promise.all([
    font(400),
    font(600),
    // A crawler should still get a card if the API is down.
    getLadder().catch(() => null),
  ])

  const title = ladder?.title ?? 'rungs'
  const total = ladder?.total ?? 8
  const long = title.length > 16

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
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
            width: 1000,
            height: 630,
            backgroundImage: glow(hue(f.rule)),
          }}
        />
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(135deg, ${hue(0)}, ${hue(2)} 45%, ${hue(4)})`,
          }}
        >
          <div style={{ width: 15, height: 15, borderRadius: 999, background: '#fff' }} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>rungs</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            fontSize: long ? 92 : 132,
            fontWeight: 600,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 36, color: '#98989d', letterSpacing: '-0.01em' }}>
          a writing game
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: i === 0 ? 64 : 16,
              borderRadius: 999,
              background: hue(i),
            }}
          />
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Geist', data: regular, weight: 400, style: 'normal' },
        { name: 'Geist', data: semibold, weight: 600, style: 'normal' },
      ],
      headers: { 'cache-control': 'public, max-age=3600' },
    },
  )
}
