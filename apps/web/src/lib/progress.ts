'use client'

import { useEffect, useState } from 'react'
import { api, type Progress } from './api'
import { setSpoilsAll, spoil, spoiled } from './storage'

// This player's progress on every ladder they've played, keyed by ladder id.
// Empty until it loads, and for anyone who hasn't typed anywhere yet.
export function useProgress() {
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  useEffect(() => {
    void api.me.progress
      .$get()
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setProgress(Object.fromEntries(rows.map((p) => [p.ladder, p]))))
      .catch(() => {})
  }, [])
  return progress
}

// Explanations and solutions give a ladder away. They show for a ladder the
// player has cleared, or once they say yes for it or for every ladder.
export function useSpoilers() {
  const progress = useProgress()
  const [mounted, setMounted] = useState(false)
  // Kept in memory too, so a yes still counts where storage is blocked.
  const [yes, setYes] = useState<{ all: boolean; ladders: string[] }>({ all: false, ladders: [] })

  // localStorage only exists after mount; until then everything stays hidden.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return {
    shown: (ladder: string) =>
      mounted &&
      (yes.all ||
        yes.ladders.includes(ladder) ||
        spoiled(ladder) ||
        progress[ladder]?.best != null),
    show: (ladder: string, all: boolean) => {
      if (all) setSpoilsAll(true)
      else spoil(ladder)
      setYes((y) => (all ? { ...y, all } : { ...y, ladders: [...y.ladders, ladder] }))
    },
  }
}
