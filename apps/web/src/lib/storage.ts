// Per-device conveniences only: the draft in progress and a personal best.
// Every access is guarded because storage can be missing or blocked. Keyed by
// ladder, so a new ladder starts from a blank page.

export type Saved = { text: string; unlocked: number; best: number | null }

const EMPTY: Saved = { text: '', unlocked: 1, best: null }
const key = (ladder: string) => `ladder.${ladder}.v1`

export function load(ladder: string): Saved {
  try {
    const raw = localStorage.getItem(key(ladder))
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Saved>) } : EMPTY
  } catch {
    return EMPTY
  }
}

export function save(ladder: string, value: Saved) {
  try {
    localStorage.setItem(key(ladder), JSON.stringify(value))
  } catch {
    // Private mode or storage disabled: the game still works, it just forgets.
  }
}
