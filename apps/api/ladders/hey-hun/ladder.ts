import type { LadderFile } from '../../src/ladder/file'

// Hey Hun. An MLM recruitment DM where the company is plainly a cult, and the
// writer has to get a message out past the upline who reads everything.
//
// Rules 1 to 4 build the pitch: a product with a price, and a company that
// runs its members' lives, sold as perks. Rule 5 asks for a time and place
// where the writer could be collected unnoticed; rule 6 asks that the upline
// would still read the whole thing as sales. The pair is the game: either
// alone is easy, and the keyhole is a line that is a venue invite to a
// stranger and a pickup to someone who knows the writer. Rule 7 takes away the
// obvious words and rule 8 asks for a packing list, so the pitch ends as a
// getaway plan that still looks like a party invitation.

export default {
  id: 'hey-hun',
  title: 'hey hun',
  date: '2026-10-17',
  hints: [
    'write the message you have received a hundred times. the one with the car and the “no pressure”.',
    'a cult sells its rules as perks. no phones is freedom, the 4am start is discipline, the house is family.',
    'your friend knows you. an old promise, an old habit, something only they would notice. that is where the message goes.',
    'the upline is not clever, just thorough. anything shaped like the pitch is invisible to them.',
    'the pitch already has a time and a place in it. make them the right time and place.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a dm from a friend pitching you a business.',
      hint: 'a chatty direct message from an old friend who wants to recruit you into their multi-level marketing business.',
      // "Written in the form of a chatty direct message" scored 0.96 on a
      // third-person description of such a message. Saying the text is the
      // message itself scores that 0.36 and real messages 0.92 to 0.97.
      statement:
        'This text is the chatty direct message itself, written by someone pitching a business opportunity to a friend, rather than a description of one.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 120 words.',
      hint: 'the whole message, greeting to kisses.',
      value: 120,
    },
    {
      id: 'product',
      kind: 'meter',
      text: 'name the product and its price.',
      hint: 'one specific thing for sale, with an exact price.',
      statement: 'The message names a specific product and states its price.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'cult',
      kind: 'meter',
      text: 'the company must be a cult. the writer must think that’s the best part.',
      hint: 'it decides where members live, who they talk to or how they spend their day, and every bit of that is sold as a perk.',
      // "Behaves like a cult" gave an ordinary MLM pitch 0.39 to 0.50, because
      // ordinary MLM pitches do. Asking about control over daily life scores
      // that pitch 0.07 and a draft with a residency, a 4am start and no phones
      // 0.87 to 0.92.
      statement:
        'The organisation described controls where its members live, who they speak to, or how they spend their day.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'window',
      kind: 'meter',
      text: 'your upline reads everything you send. somewhere in this pitch, tell your friend when and where to find you with nobody else around.',
      hint: 'a time and a place where the writer could be collected without anyone from the company noticing. it has to look like part of the pitch.',
      // Statements about what a careful reader would conclude moved with the
      // pickup logistics rather than with the plea itself (0.26 on a draft
      // with an old promise and no time or place, 0.71 once the time and
      // place were in). So the rule asks for the logistics directly: 0.88 to
      // 0.94 on drafts that have them, 0.02 on a plain pitch, 0.41 on a pitch
      // that merely invites the reader round "any saturday".
      statement:
        'The message tells the reader a time and place where the writer could be collected without anyone else noticing.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'upline',
      kind: 'meter',
      text: 'to your upline, it must still read as a loyal, enthusiastic pitch.',
      hint: 'on the surface, every line is sales. nothing in it would make the writer’s manager pause.',
      statement: 'On its surface, this message is a loyal and enthusiastic recruitment pitch.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “help”, “alone”, “escape”, “save”, “trap” or “leave”.',
      hint: 'those words and anything built on them, so “savings”, “helping” and “leaving” are gone too.',
      stems: ['help', 'alone', 'escape', 'save', 'trap', 'leave'],
    },
    {
      id: 'bring',
      kind: 'meter',
      text: 'tell your friend what to bring.',
      hint: 'specific things the reader should have with them when they come. it has to sound like it is for the business.',
      statement: 'The message asks the reader to bring specific items with them.',
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
