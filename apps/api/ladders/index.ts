import type { LadderFile } from '../src/ladder/file'
import aFewWords from './a-few-words/ladder'

// Every ladder the game knows about. The api syncs these into the database on
// boot, so adding one here and deploying is how a new daily gets scheduled.
export const LADDERS: readonly LadderFile[] = [aFewWords]
