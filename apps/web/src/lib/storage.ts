// Per-device settings only. Progress lives on the server. Every access is
// guarded because storage can be missing or blocked.

const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key: string, value: string | null) => {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Private mode or storage disabled: asked again next time, which is fine.
  }
}

// A browser may hold a draft saved on the device under this key. It's only
// read when the server has nothing for that ladder, so it isn't lost.
export function localDraft(ladder: string): { text: string; unlocked: number } | null {
  try {
    const saved = JSON.parse(read(`ladder.${ladder}.v1`) ?? 'null') as {
      text?: string
      unlocked?: number
    } | null
    return saved?.text ? { text: saved.text, unlocked: saved.unlocked ?? 1 } : null
  } catch {
    return null
  }
}

// Whether the player already said yes to spoilers for one ladder, or for all.
const spoilKey = (ladder: string) => `ladder.${ladder}.spoil`
const ALL = 'spoilers.all'

export const spoiled = (ladder: string) => read(ALL) === '1' || read(spoilKey(ladder)) === '1'
export const spoilsAll = () => read(ALL) === '1'
export const spoil = (ladder: string) => write(spoilKey(ladder), '1')
export const setSpoilsAll = (on: boolean) => write(ALL, on ? '1' : null)
