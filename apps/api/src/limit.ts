// Past this, the oldest key is forgotten, so a flood of new keys can't grow the
// map without end. A forgotten key only gets to start its window over.
const MAX_KEYS = 10_000

// Fixed-window counter: `allow(key)` is true for the first `max` calls per key
// in each window.
// shortcut: counts live in this process and reset on deploy; move them to
// Postgres or Redis if the API ever runs as more than one instance.
export function limiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>()
  return (key: string) => {
    const now = Date.now()
    let hit = hits.get(key)
    if (!hit || hit.resetAt <= now) {
      if (!hit && hits.size >= MAX_KEYS) hits.delete(hits.keys().next().value!)
      hit = { count: 0, resetAt: now + windowMs }
      hits.set(key, hit)
    }
    return ++hit.count <= max
  }
}
