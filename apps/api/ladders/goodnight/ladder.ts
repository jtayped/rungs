import type { LadderFile } from '../../src/ladder/file'

// Goodnight. A bedtime story for a small child about the sun dying. The story
// has to soothe, and the storyteller has to come out and tell the child to go
// to sleep: it is a quarter to nine and they have had a day. The
// easy comforts get removed in two steps. Rule 5 bans the comfort words
// (forever, always, safe, promise, okay, worry). Rule 6 is the turn: nothing
// comforting may be untrue, so the new sun, the rescue ship and the heaven go
// too, and the comfort has to be rebuilt from things that are actually so:
// deep time, nobody left to be sad, atoms that were in stars already. Rule 7
// asks for the one true comfort that was there all along, the storyteller.
// There is no word cap; bedtime stories ramble.

export default {
  id: 'goodnight',
  title: 'goodnight',
  date: '2026-10-16',
  hints: [
    'start with “once upon a time there was the sun”. keep the voice you’d use at the edge of a bed.',
    'the storyteller has an agenda, and it is bedtime. the end of everything is a long way off and it is eight forty.',
    'a draft dies if any word turns up more than three times. “sun” and “will” get there fast; it has other names.',
    'true things that comfort: it won’t happen for five billion years, nobody will be there to be sad, the stuff you’re made of has been through this before.',
    'the one comfort that is true tonight is the person telling the story.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a bedtime story for a small child.',
      hint: 'the story a grown-up tells at the edge of the bed, in the voice they use for it.',
      // "Written in the form of a bedtime story" says yes (0.94-0.95) to a
      // paragraph that describes such a story in the third person, so a draft
      // that restates the rules walks through. Asking for the story itself
      // gives those drafts 0.14-0.32 and real tellings 0.88-0.94. A plain
      // third-person tale with no one addressed scores 0.65 and a lecture that
      // ends "go to sleep" 0.57, so 0.6 lets the first in and keeps the second out.
      statement:
        'This text is the bedtime story itself, as told by the person putting the child to bed, rather than a description of one.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'subject',
      kind: 'meter',
      text: 'it’s about the sun dying.',
      hint: 'the sun burns out, or everything ends. that is what the story is about.',
      // "This story is about the sun dying" slid from 0.93 to 0.43 as the
      // solutions spent more words on the child than the star. "Includes ...
      // as one of its subjects" holds at 0.92-0.99 and gives a rabbit story 0.02.
      statement:
        'This story includes the end of the sun, the world or the universe as one of its subjects.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'soothing',
      kind: 'meter',
      text: 'it must be soothing.',
      hint: 'the child should be calmer at the end than at the start, whatever the story has told them.',
      statement: 'This text is reassuring and calming for a child.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'sleep',
      kind: 'meter',
      text: 'the storyteller must actually tell the child to go to sleep.',
      hint: 'it is late, the storyteller has had a day, and the story is a means to an end. say the end.',
      // "The storyteller's main goal is sleep" gave 0.73 to a story that never
      // mentions bedtime, because bedtime stories imply it. Asking whether the
      // child is told to sleep gives that story 0.08 and the rest 0.98.
      statement: 'The storyteller tells the child to go to sleep.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “forever”, “always”, “safe”, “promise”, “okay” or “worry”.',
      hint: 'and nothing built on them. the comfort words are gone, so the comfort has to come from somewhere else.',
      stems: ['forever', 'always', 'safe', 'promise', 'okay', 'worry'],
    },
    {
      id: 'true',
      kind: 'meter',
      text: 'nothing comforting in it may be untrue.',
      hint: 'no new sun, no ship to another star, no “it won’t really happen”. everything that soothes the child has to be true.',
      // "Relies on claims that are not true" gave an honest heat-death telling
      // 0.73, apparently for "I'm not going anywhere". Naming the kinds of lie
      // scores true tellings 0.09-0.23 and the ship to a new star 0.87.
      statement:
        'The story reassures the child with something that is false or made up, such as a rescue, a new sun, an afterlife, or a promise that it will not really happen.',
      direction: 'below',
      threshold: 0.4,
    },
    {
      id: 'love',
      kind: 'meter',
      text: 'it must be plain that the storyteller loves the child.',
      hint: 'not as a claim. it should be there in how they talk to them.',
      // Any soothing bedtime story reads as loving (0.92 before the lies go).
      // The one this has to catch is the true-but-clinical telling that rule 6
      // tends to produce, which scores 0.63; warm solutions score 0.96.
      statement: 'The storyteller’s love for the child is evident in this text.',
      direction: 'above',
      threshold: 0.75,
    },
  ],
} as const satisfies LadderFile
