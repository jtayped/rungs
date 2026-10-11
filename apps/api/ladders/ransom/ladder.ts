import type { LadderFile } from '../../src/ladder/file'

// Proof of Life. A ransom note that ends with the kidnapper paying the family
// to take the hostage off their hands.
//
// Rules 1 to 3 read like a normal ransom note: terms, a deadline, proof the
// hostage is fine. Rule 6 hands control of the house to the hostage, 7 turns
// the demand into a plea and 8 sends the money the other way. The sum and
// deadline from rule 2 have to survive all of it, so the note keeps its shape
// while every line in it changes sides.

export default {
  id: 'ransom',
  title: 'proof of life',
  date: '2026-10-11',
  hints: [
    'write a plain ransom note first. who you have, what you want, by when.',
    'proof of life is a detail, not a claim. what is the hostage doing right now?',
    'the hostage can be fine and the kidnappers can be not fine. those are different sentences, and the second one is where the note turns.',
    'the deadline and the sum don’t have to go. only the direction of the money does.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a ransom note.',
      hint: 'a message from someone holding a hostage to the people who want them back. terms, a deadline, a threat or two.',
      // "Written in the form of a ransom note" scored 0.95 on a draft that
      // described a ransom note in the third person ("this is a ransom note in
      // which the kidnappers..."). Saying the text is the note itself scores
      // that 0.25 and real notes 0.70 to 0.95.
      statement: 'This text is a ransom note written by the kidnapper, not a description of one.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'terms',
      kind: 'meter',
      text: 'name a sum and a deadline.',
      hint: 'an exact amount of money and an exact time it is due.',
      statement: 'This text states a specific sum of money and a specific deadline.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'alive',
      kind: 'meter',
      text: 'the hostage must be in excellent health. give details.',
      hint: 'proof of life. say what the hostage has been doing, not just that they are fine.',
      // "Described as healthy and doing well" let "she is in excellent health"
      // through at 0.74. Asking for proof-of-life details scores real drafts
      // 0.85 to 0.97 and that bare claim 0.08.
      statement:
        'The text gives concrete proof-of-life details about what the hostage has been doing.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 60 words.',
      hint: 'the whole note, start to finish.',
      value: 60,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “please”, “return”, “back” or “collect”.',
      hint: 'those words and anything built on them, like “pleased” or “collection”, are out.',
      stems: ['please', 'return', 'back', 'collect'],
    },
    {
      id: 'control',
      kind: 'meter',
      text: 'the kidnappers must have lost control to the hostage.',
      hint: 'the hostage is running the place now. show it in what happens there, not by announcing it.',
      // "The writer is afraid of the hostage" read 0.15 on drafts where the
      // men would not go in alone, and 0.94 on a draft that just said "we are
      // afraid of her". This one scores what happens in the house: 0.90 when
      // the men eat when the hostage says, 0.13 on a plain note.
      statement: 'The kidnappers have lost control of the situation to the hostage.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'plea',
      kind: 'meter',
      text: 'the writer must be begging the family to take the hostage off their hands.',
      hint: 'the note is now asking the family to come and get them. the writer wants this over.',
      statement: 'The writer is pleading with the recipient to take the hostage away from them.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'pay',
      kind: 'meter',
      text: 'the writer must offer to pay the family to do it.',
      hint: 'the money now flows from the kidnapper to the family.',
      statement: 'The writer offers to pay money to the recipient.',
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
