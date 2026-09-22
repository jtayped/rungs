'use client'

import { motion } from 'motion/react'

// How close the draft is to making the current rule hold. It moves once per
// judgement, after the typing pause, so it follows the writing without
// jittering on every key.
export function Meter({
  progress,
  color,
  pending,
}: {
  progress: number
  color: string
  pending: boolean
}) {
  const value = Math.max(0, Math.min(progress, 1))
  return (
    <div
      role="meter"
      aria-label="how close you are"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="bg-hairline relative h-2.5 w-full max-w-md overflow-hidden rounded-full"
    >
      <motion.div
        className="absolute inset-0 origin-left rounded-full"
        style={{ backgroundColor: color }}
        initial={false}
        animate={{ scaleX: value, opacity: pending ? 0.55 : 1 }}
        transition={{
          scaleX: { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 },
          opacity: { duration: 0.4 },
        }}
      />
    </div>
  )
}
