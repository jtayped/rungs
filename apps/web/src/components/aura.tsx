'use client'

import { motion } from 'motion/react'

// Three soft fields of colour behind everything. They take the current rule's
// hue and its neighbours, so the page itself tells you where you are.
const FIELDS = [
  'left-[-30%] top-[-20%] h-[70vmax] w-[70vmax]',
  'right-[-35%] top-[15%] h-[60vmax] w-[60vmax] [animation-delay:-7s]',
  'bottom-[-30%] left-[10%] h-[55vmax] w-[55vmax] [animation-delay:-14s]',
]

export function Aura({ colors }: { colors: readonly string[] }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {FIELDS.map((place, i) => (
        <motion.div
          key={i}
          className={`drift absolute rounded-full blur-[90px] will-change-transform ${place}`}
          style={{ opacity: 'var(--aura-opacity)' }}
          initial={false}
          animate={{ backgroundColor: colors[i % colors.length] }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  )
}
