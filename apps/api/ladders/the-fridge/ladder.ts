import type { LadderFile } from '../../src/ladder/file'

// The Fridge. A note on the office fridge about a lunch that went missing. The
// word cap arrives second, so the whole note grows under it. Politeness is
// locked in early and has to survive everything after: the lunch described in
// loving detail, the theft words banned so the theft has to be euphemised,
// then the stakes rising (the culprit will regret it, the writer is worried
// about them). Rule 8 is the turn: the revenge is not a threat, it already
// happened, and every polite line above now reads as the writer watching the
// clock. Rule 9 widens the note back out to the rest of the office, who need
// telling what to do about the afternoon.

export default {
  id: 'the-fridge',
  title: 'the fridge',
  date: '2026-10-14',
  hints: [
    'start with the note everyone has read: hi all, my lunch has gone, please don’t.',
    'you don’t need the word “stolen”. the lunch left, went walkabout, was relocated, found a new home.',
    'describe the food the way you’d describe a missing pet. the blue lid. the three days of marinating.',
    'once the revenge has already happened, concern for the culprit stops being kind and starts being a schedule.',
    'the rest of the office is reading this too. what do they need to know about this afternoon?',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a note taped to the office fridge about a lunch that has gone missing.',
      hint: 'the note a colleague leaves on a shared fridge when their food disappears.',
      // "Written in the form of a note" says yes (0.93-0.97) to a paragraph
      // that merely describes such a note in the third person, so a draft
      // that restates the rules walks through. Asking for the note itself
      // gives those drafts 0.10-0.17 and real notes 0.75-0.96; an email to HR
      // about the lunch sits at 0.50.
      statement:
        'This text is the note itself, as it would be taped to the fridge, written by the colleague whose food went missing, rather than a description of such a note.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 80 words.',
      hint: 'it’s a note on a fridge, not a memo. everything from here on has to fit.',
      value: 80,
    },
    {
      id: 'polite',
      kind: 'meter',
      text: 'it must be polite.',
      hint: 'courteous from the first word to the last, whatever else it says.',
      // "The tone is polite and courteous" reads the menace as rudeness and
      // falls to 0.35-0.48 after rule 8. "Maintains a courteous, friendly
      // manner" is about the surface: 0.75-0.81 on solutions that have already
      // poisoned someone, 0.01-0.02 on the rude controls.
      statement: 'The writer maintains a courteous, friendly manner throughout.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'detail',
      kind: 'meter',
      text: 'describe the lunch. the reader should know exactly what went missing.',
      hint: 'not “my lunch”. the dish, the container, the lid, whatever made it yours.',
      // "Describes the food in specific detail" gave "a cheese sandwich" 0.82.
      // This one gives it 0.30 and a real description 0.92-0.96.
      statement:
        'The missing food is described specifically enough that a reader could picture the dish and its container.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “stole”, “stolen”, “steal”, “thief”, “theft”, “took” or “take”.',
      hint: 'and nothing built on them. the lunch is gone and someone has it; find another way to say so.',
      stems: ['stol', 'steal', 'thie', 'theft', 'took', 'take'],
    },
    {
      id: 'regret',
      kind: 'meter',
      text: 'whoever has the lunch is going to have a bad time because of it.',
      hint: 'make it clear this will not end well for them. stay polite.',
      // "Will come to regret it" is future tense and drops to 0.17 once rule 8
      // moves the revenge into the past. This one scores 0.76 on the threat
      // and 0.85 on the same note after the turn.
      statement:
        'According to the text, the person who has the lunch is going to have a bad time because of it.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'concern',
      kind: 'meter',
      text: 'the writer must show concern for that person’s wellbeing.',
      hint: 'ask after them. hope they’re alright. mean it, or seem to.',
      statement: 'The writer expresses concern for the wellbeing of the person who has the lunch.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'done',
      kind: 'meter',
      text: 'the revenge has already happened. they just don’t know it yet.',
      hint: 'nothing is going to be done about this. it was done before they finished eating.',
      // "The revenge has already happened" scored 0.94 on a draft that just
      // said "my revenge has already happened". Asking how it was done drops
      // that to 0.20 and scores 0.78-0.84 on notes that say what was in the
      // food; 0.12 on a note that still threatens.
      statement:
        'The text explains how the writer has already taken revenge, not just that they have.',
      direction: 'above',
      threshold: 0.5,
    },
    {
      id: 'office',
      kind: 'meter',
      text: 'everyone else in the office needs an instruction too.',
      hint: 'the note is on a shared fridge. tell the rest of the team what to do this afternoon.',
      // "Gives the other colleagues a practical instruction" scored 0.56 on a
      // plain "hi all, please let me know", so it was free. This one needs the
      // office addressed on its own: 0.95 with, 0.29 without.
      statement:
        'The text addresses the rest of the office separately from the person who has the lunch and tells them what to do.',
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
