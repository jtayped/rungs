'use client'

import { AnimatePresence, motion } from 'motion/react'
import { describe } from '~/lib/describe'
import { hue } from '~/lib/palette'
import type { RuleView } from '~/lib/use-ladder'
import { Ring } from './ring'

// Every rule before the newest one. They all held once; this is where you
// find out which one your last sentence just broke.
export function RuleList({ rules, empty }: { rules: RuleView[]; empty: boolean }) {
  if (!rules.length) return null
  return (
    <section aria-label="earlier rules">
      <h3 className="text-muted mb-3 px-1 text-[13px] font-medium">still has to hold</h3>
      <ul className="bg-sheet ring-hairline overflow-hidden rounded-[26px] ring-1 backdrop-blur-2xl">
        <AnimatePresence initial={false}>
          {[...rules].reverse().map((rule) => (
            <motion.li
              key={rule.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="border-hairline border-b last:border-b-0"
            >
              {/* Keyed by state, so the shake plays once, at the moment it breaks. */}
              <motion.div
                key={rule.state}
                animate={rule.state === 'broken' ? { x: [0, -5, 5, -3, 3, 0] } : undefined}
                transition={{ duration: 0.45 }}
                className="flex items-start gap-3.5 px-4 py-3.5"
              >
                <Ring
                  progress={rule.progress}
                  color={hue(rule.index)}
                  holds={rule.state === 'holds'}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug font-medium tracking-[-0.01em]">
                    {rule.text}
                  </p>
                  <p
                    className={`mt-0.5 text-[13px] ${rule.state === 'broken' ? 'text-ink font-semibold' : 'text-muted'}`}
                  >
                    {describe(rule, empty)}
                  </p>
                </div>
              </motion.div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
