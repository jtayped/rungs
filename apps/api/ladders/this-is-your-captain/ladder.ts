import type { LadderFile } from '../../src/ladder/file'

// This Is Your Captain. A captain's announcement on a plane that is going
// down, delivered in the voice that normally tells you about the weather in
// Denver.
//
// The joke is a tone lock under escalation. Rule 2 puts the plane in the
// ground, rule 3 locks the register to routine, and every rule after that adds
// worse news that has to arrive in the same voice: the banned list takes away
// the honest words, the word cap takes away the room to soften anything, the
// sightseeing rung points the cabin at the missing engine, and the last rung
// asks for the arrival time. The player's routine announcement from rule 1
// stays mostly intact; only what it describes has changed.
//
// Meter statements ask about form and register. "The aircraft is about to
// crash" fell to 0.13 on a draft that had every fact in it except where the
// plane would end up, so rule 2 asks the player to say that out loud.

export default {
  id: 'this-is-your-captain',
  title: 'this is your captain',
  date: '2026-10-11',
  hints: [
    'write the ordinary announcement first: altitude, weather, arrival time. you’ll keep more of it than you think.',
    'the airline has a soft word for everything. a crash is an early arrival and a field is a destination.',
    'the engine is the obvious thing to point at. the ground works too.',
    'say the number of minutes and move on. the captain doesn’t explain it, so neither do you.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is the captain’s announcement to the passengers.',
      hint: 'the voice on the cabin speakers, from the flight deck, talking to everyone on board.',
      // "Written in the form of an announcement" scored 0.93 on a draft that
      // just restated the rules in the third person ("the captain sounds
      // calm..."). Asking for the announcement itself drops that draft to
      // 0.21 and keeps real ones at 0.84 to 0.96.
      statement:
        'This text is the captain’s announcement itself, spoken to the passengers, rather than a description of one.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'down',
      kind: 'meter',
      text: 'the plane is going down, and it isn’t going to reach an airport.',
      hint: 'say so, and say where it will end up instead. the passengers need to understand what is happening.',
      // Drafts that gave the field, the open country or "not as far as Denver"
      // scored 0.87 to 0.98. The same announcement with the destination cut
      // scored 0.05, and a routine one 0.01.
      statement:
        'The text indicates that the aircraft is going down and will not reach an airport.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'calm',
      kind: 'meter',
      text: 'the captain must sound exactly the way they do on every other flight.',
      hint: 'calm and matter-of-fact. the voice that tells you about the weather at your destination.',
      // "Calm and routine" alone scored 0.69 on the dry crash drafts; adding
      // "like a routine announcement" lifts them to 0.80 to 0.89. Grave
      // "listen to me very carefully" drafts score 0.38 to 0.62, so 0.7 keeps
      // out even the most measured of those, where 0.6 would not.
      statement: 'The speaker’s delivery is calm and matter-of-fact, like a routine announcement.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “land”, “crash”, “emergency”, “brace”, “impact” or “problem”.',
      hint: 'and nothing built on them: no landing, no bracing, no problems. find the airline’s word for it.',
      stems: ['land', 'crash', 'emergenc', 'brace', 'impact', 'problem'],
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 65 words.',
      hint: 'the whole announcement. there isn’t time for more.',
      value: 65,
    },
    {
      id: 'window',
      kind: 'meter',
      text: 'the captain must point out something for the passengers on one side to look at.',
      hint: 'the sightseeing announcement. those of you on the left will see something out of the window.',
      // 0.93 to 0.98 whenever one side of the cabin is told to look, 0.01 to
      // 0.02 otherwise. A vaguer "points out something to see" let a draft with
      // no such line through at 0.45.
      statement:
        'The speaker tells passengers on one side of the aircraft to look at something outside.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'minutes',
      kind: 'meter',
      text: 'the captain must say how long until the plane is on the ground, and it’s less than five minutes.',
      hint: 'a time estimate, like every arrival announcement. this one is short.',
      // "About four minutes" scores 0.97; the same draft saying "about ten
      // minutes" scores 0.01, and "shortly" scores 0.10.
      statement:
        'The announcement says the aircraft will be on the ground in less than five minutes.',
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
