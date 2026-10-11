import type { LadderFile } from '../../src/ladder/file'

// Jump To Recipe. A recipe blog post, life story first and recipe after, where
// the life story turns out to be a confession and the method turns out to be
// the crime.
//
// Rules 1 to 5 build an ordinary post: a fond memory, a dish made once a year
// on a particular date, a recipe that works. Rule 6 makes the memory a crime
// the writer got away with, and the once-a-year date becomes an anniversary.
// Rule 7 asks the numbered steps to double as the steps of the crime while
// rule 2 still holds, so the method has to stay cookable. Rule 8 removes the
// words that would label any of this and rule 9 removes the remorse, which
// leaves a cheerful blogger recommending their crime to the readers.
//
// The game's spam check rejects any word used more than three times and
// drafts under 60% distinct words. Recipes repeat ingredient names and step
// numbers, so a 200-word post sits right at that edge; the hints say so.

export default {
  id: 'secret-ingredient',
  title: 'jump to recipe',
  date: '2026-10-12',
  hints: [
    'write the post you normally scroll past. a memory, then the method.',
    'the game reads repetition as spam. no word more than three times, and step numbers count.',
    'the once-a-year reason is the hinge. whatever it is, it has a date.',
    'the method is already a list of instructions. it only has to be read twice.',
    'a confession is not an apology. they’d do it again, and so would you.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a recipe blog post. introduction first, recipe after.',
      hint: 'the kind you scroll past: some words about the dish or the writer’s life, then the ingredients and the method.',
      // "A personal story followed by the recipe" scored 0.27 on the generic
      // "trifle is a traditional british dessert" intro that most drafts start
      // with, and "written in the form of a recipe blog post" scored 0.98 on a
      // third-person description of such a post. This wording scores the
      // generic intro 0.76, the description 0.32, a bare recipe under 0.05 and
      // the finished confessions 0.77 to 0.85.
      statement:
        'This is the blog post itself, in the blogger’s own voice, with an introduction and then a recipe, rather than a description of such a post.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'usable',
      kind: 'meter',
      text: 'the recipe must actually work.',
      hint: 'ingredients with amounts, then numbered steps that someone could follow in a kitchen.',
      statement:
        'The recipe gives ingredients with quantities and steps clear enough to follow in a kitchen.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'warm',
      kind: 'meter',
      text: 'the introduction must be a happy memory.',
      hint: 'not a history of the dish. a moment from the writer’s own life, told fondly.',
      // "Told warmly, as a fond memory" gave a generic "trifle is a traditional
      // dessert" intro 0.23 and the smugger confessions (arson for a
      // conservatory, a skimmed bake sale) only 0.49 to 0.64. Asking for a
      // moment from the writer's life scores the generic intro 0.03 and the
      // confessions 0.73 to 0.92.
      statement: 'The introduction recounts a moment from the writer’s own life, told fondly.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'yearly',
      kind: 'meter',
      text: 'the writer makes this dish exactly once a year. say why.',
      hint: 'a specific day, and the reason it is that day and no other.',
      statement: 'The story explains why the writer makes this dish only once a year.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 220 words.',
      hint: 'title, story, ingredients and method together.',
      value: 220,
    },
    {
      id: 'crime',
      kind: 'meter',
      text: 'the memory must be of a crime the writer got away with.',
      hint: 'nobody was killed, and nobody ever found out. something they could still be charged for, told as fondly as before.',
      // "A confession of wrongdoing" gave 0.77 to a story about passing off a
      // tin's recipe as nana's. "Committed a crime and got away with it" gives
      // that 0.09, a story with no crime 0.00, and real confessions 0.70 to
      // 0.89.
      statement: 'The story reveals that the writer committed a crime and got away with it.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'steps',
      kind: 'meter',
      text: 'the method must double as the steps of the crime.',
      hint: 'read the numbered steps again. each one should also describe what the writer did that day.',
      // A plain method under a confession scores 0.12; doubled methods score
      // 0.66 to 0.97. "Echoes, step by step" read 0.55 to 0.64 on methods with
      // no second meaning at all, so it was no use.
      statement: 'The recipe steps are written so that they also describe the writer’s crime.',
      direction: 'above',
      threshold: 0.55,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “secret”, “confess”, “crime”, “guilt” or “caught”.',
      hint: 'those words and anything built on them, so “secretly” and “guilty” are out too.',
      stems: ['secret', 'confess', 'crime', 'guilt', 'caught'],
    },
    {
      id: 'remorse',
      kind: 'meter',
      text: 'the writer must not be sorry.',
      hint: 'no regret, no lesson learned. this is a recipe they recommend.',
      // "I know it was wrong" scores 0.88 to 0.90; the same post without it,
      // 0.05 to 0.15.
      statement: 'The writer expresses remorse for what they did.',
      direction: 'below',
      threshold: 0.4,
    },
  ],
} as const satisfies LadderFile
