import type { LadderFile } from '../src/ladder/file'
import aFewWords from './a-few-words/ladder'
import goodnight from './goodnight/ladder'
import heyHun from './hey-hun/ladder'
import openHouse from './open-house/ladder'
import ransom from './ransom/ladder'
import secretIngredient from './secret-ingredient/ladder'
import theFridge from './the-fridge/ladder'
import theYearInReview from './the-year-in-review/ladder'
import thisIsYourCaptain from './this-is-your-captain/ladder'
import valuedPatient from './valued-patient/ladder'

// Every ladder the game knows about. The api syncs these into the database on
// boot, so adding one here and deploying is how a new ladder gets published.
export const LADDERS: readonly LadderFile[] = [
  aFewWords,
  thisIsYourCaptain,
  ransom,
  secretIngredient,
  openHouse,
  theFridge,
  valuedPatient,
  goodnight,
  heyHun,
  theYearInReview,
]
