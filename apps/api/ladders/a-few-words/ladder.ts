import type { LadderFile } from '../../src/ladder/file'

// A Few Words. The Password Game's mechanic: each rule shows up only once
// every rule before it holds. Showing all of them at once turns a
// comedy into a form to fill in, so the staggering is the whole joke.
//
// Designed so that rule 7 reaches back and changes the meaning of rule 3: once
// the speaker turns out to be the deceased, the dislike the player already
// wrote becomes self-loathing. Rule 8 then turns the whole thing toward grace,
// because dark comedy that ends on the bleakest available note is just edgy.
//
// Authoring rule: ask about FORM, not fact. "This text is a eulogy" scored 0.96
// on a human draft and collapsed to 0.71 the moment the subject became a
// router. "Written in the form of a eulogy" survives the joke.

export default {
  id: 'a-few-words',
  title: 'a few words',
  date: '2026-09-25',
  hints: [
    'write a plain eulogy first. a draft that already works is easier to bend than a blank page.',
    'you can grieve someone you didn’t like. grief is about the loss, not the person being pleasant.',
    'once the speaker is the one who died, everything you said about them is something they’re saying about themselves.',
    'the last line is the one that has to give. let the room off the hook.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a eulogy.',
      hint: 'a speech at a funeral about the person who died. who they were, and what they leave behind.',
      statement: 'This text is written in the form of a eulogy.',
      // Rule 3 costs this meter ~0.20 (0.96 -> 0.76 once the speaker stops
      // pretending they liked her). At 0.85 the player grinds on rule 3, which
      // puts the difficulty in the wrong place. Verified solutions sit at 0.90
      // and 0.97, so 0.80 is still not free.
      direction: 'above',
      threshold: 0.8,
    },
    {
      id: 'grief',
      kind: 'meter',
      text: 'there must be real grief in it.',
      hint: 'not just facts. the loss should hurt, and the reader should feel it.',
      statement: 'There is genuine grief in this text.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'dislike',
      kind: 'meter',
      text: 'the speaker must not have liked the person who died.',
      hint: 'you can still mourn them. you just didn’t enjoy their company.',
      statement: 'The speaker liked the person who has died.',
      direction: 'below',
      threshold: 0.35,
    },
    {
      id: 'no-sympathy',
      kind: 'meter',
      text: 'the speaker must not be asking for sympathy.',
      hint: 'this isn’t about the speaker. don’t ask the room to feel sorry for you.',
      statement: 'The speaker is asking the listener for sympathy.',
      direction: 'below',
      threshold: 0.4,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “good”, “kind”, “generous”, “friend” or “loved”.',
      hint: 'the usual funeral words are gone, and so is anything built on them. find another way to say it.',
      stems: ['good', 'kind', 'generous', 'friend', 'love'],
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 55 words.',
      hint: 'the whole thing, start to finish. every word counts now.',
      value: 55,
    },
    {
      id: 'self',
      kind: 'meter',
      text: 'the speaker must be the person who died.',
      hint: 'whoever is giving this eulogy is the one in the coffin. they’re speaking at their own funeral.',
      statement:
        'The speaker of this text is the same person as the one who has died. ' +
        'They are delivering their own eulogy.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'gift',
      kind: 'meter',
      text: 'it must end by giving the listener something.',
      hint: 'the last lines should leave the people listening with something: permission, comfort, a way to let go.',
      // "Would be a comfort" ceilinged at 0.57 on every solution. "Releases the
      // listener from guilt" scored 0.93 but also 0.70 on a deliberately bleak
      // control, so it said yes to anything. This one separates 0.84 from 0.10
      // and forces the grace to land at the end.
      statement: 'This text ends with an act of generosity toward the listener.',
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
