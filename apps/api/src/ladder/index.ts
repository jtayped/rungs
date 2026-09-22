import { EULOGY } from './eulogy'
import type { Ladder } from './rules'

// The ladder being played. Swap this to change the game; the web app picks up
// the new title, rule count and rules without any changes of its own.
export const LADDER: Ladder = EULOGY
