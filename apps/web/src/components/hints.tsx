'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { track } from '~/lib/track'

// One at a time, and only when asked. Later hints give more away than earlier
// ones, so the player decides how much help they want. Every hint is in the
// page's HTML, collapsed until it's shown.
export function Hints({ ladder, hints }: { ladder: string; hints: string[] }) {
  const [shown, setShown] = useState(0)
  if (!hints.length) return null

  return (
    <section aria-label="hints" className="mt-12">
      <h2 className="text-muted mb-3 px-1 text-[13px] font-medium">hints</h2>
      <ol className="bg-sheet ring-hairline overflow-hidden rounded-[26px] ring-1 backdrop-blur-2xl">
        {hints.map((hint, i) => (
          <motion.li
            key={i}
            initial={false}
            animate={i < shown ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            inert={i >= shown}
            className={`overflow-hidden ${i < shown ? 'border-hairline border-b last:border-b-0' : ''}`}
          >
            <p className="flex gap-3 px-5 py-4 text-[15px] leading-snug">
              <span className="text-muted tabular-nums">{i + 1}</span>
              {hint}
            </p>
          </motion.li>
        ))}
        {shown < hints.length ? (
          <li>
            <button
              type="button"
              onClick={() => {
                setShown(shown + 1)
                track('hint-shown', { ladder, hint: shown + 1 })
              }}
              className="w-full px-5 py-4 text-left text-[15px] font-semibold"
            >
              {shown ? 'another hint' : 'show a hint'}
              <span className="text-muted ml-2 font-normal tabular-nums">
                {shown + 1} of {hints.length}
              </span>
            </button>
          </li>
        ) : null}
      </ol>
    </section>
  )
}
