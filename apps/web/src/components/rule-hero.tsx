'use client'

import { AnimatePresence, motion } from 'motion/react'
import { describe } from '~/lib/describe'
import { hue } from '~/lib/palette'
import type { RuleView } from '~/lib/use-ladder'
import { Meter } from './meter'

// The newest rule, set large. It is the only instruction on the screen that
// matters right now, so it gets the scale of a headline.
type Props = { rule: RuleView | undefined; empty: boolean; pending: boolean }

export function RuleHero({ rule, empty, pending }: Props) {
  return (
    <div className="relative min-h-[9.5rem] sm:min-h-[12rem]" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        {rule ? (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -28, filter: 'blur(10px)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="inline-flex h-7 items-center gap-2 rounded-full px-3 text-[13px] font-semibold tracking-[-0.01em]"
                style={{
                  backgroundColor: `color-mix(in oklab, ${hue(rule.index)} 16%, transparent)`,
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: hue(rule.index) }}
                />
                rule {rule.index + 1}
              </span>
              <motion.span
                key={`${rule.id}-${describe(rule, empty)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted text-[13px] font-medium"
              >
                {describe(rule, empty)}
              </motion.span>
            </div>
            <h2 className="font-display text-[clamp(1.9rem,7.4vw,3.4rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance">
              {rule.text}
            </h2>
            <p className="text-muted mt-3 max-w-md text-[17px] leading-[1.45] tracking-[-0.01em] text-pretty sm:text-[19px]">
              {rule.hint}
            </p>
            <div className="mt-6">
              <Meter progress={rule.progress} color={hue(rule.index)} pending={pending} />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3 pt-11" aria-hidden>
            <div className="bg-hairline h-9 w-4/5 animate-pulse rounded-2xl" />
            <div className="bg-hairline h-9 w-3/5 animate-pulse rounded-2xl" />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
