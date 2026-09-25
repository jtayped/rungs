'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

// One at a time, and only when asked. Later hints give more away than earlier
// ones, so the player decides how much help they want.
export function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0)
  if (!hints.length) return null

  return (
    <section aria-label="hints" className="mt-12">
      <h2 className="text-muted mb-3 px-1 text-[13px] font-medium">hints</h2>
      <ol className="bg-sheet ring-hairline overflow-hidden rounded-[26px] ring-1 backdrop-blur-2xl">
        <AnimatePresence initial={false}>
          {hints.slice(0, shown).map((hint, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="border-hairline border-b last:border-b-0"
            >
              <p className="flex gap-3 px-5 py-4 text-[15px] leading-snug">
                <span className="text-muted tabular-nums">{i + 1}</span>
                {hint}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
        {shown < hints.length ? (
          <li>
            <button
              type="button"
              onClick={() => setShown(shown + 1)}
              className="text-hue w-full px-5 py-4 text-left text-[15px] font-semibold"
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
