import type { LadderFile } from '../../src/ladder/file'

// Open House. A real-estate listing for a house where someone was killed. The
// agent has to disclose it and stay upbeat, then the death words are banned so
// the disclosure has to come through by implication. Rules 6 and 7 then reveal
// who the listing is for: one reader who already knows the house, who turns out
// to be the one who did it. Every feature the player already sold ("the back
// gate still doesn't lock", "professionally cleaned twice") becomes a wink, and
// rule 8 forbids the one easy move left, saying anything against them. Rule 9
// then makes the agent explain why this buyer, of all people, is the right one.

export default {
  id: 'open-house',
  title: 'open house',
  date: '2026-10-13',
  hints: [
    'write a normal listing first. three bedrooms, a garden, the station. you’ll bend it later.',
    'you can disclose a killing without any of the words for it. say where the owner was found and who wasn’t.',
    'once the listing is for one reader, the features you already praised are things they’ve seen. “as you’ll remember” does a lot of work.',
    'an agent never accuses a buyer. they agree with them. “we think you’ll find it came up beautifully.”',
    'why would an agent want this buyer? they won’t ask about the kitchen, they won’t need a survey, and they already have a key.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a real-estate listing.',
      hint: 'the write-up an estate agent puts on a house for sale: rooms, features, area, price.',
      // "Written in the form of a listing" says yes (0.88-0.91) to a paragraph
      // that describes such a listing in the third person, so a draft that
      // restates the rules walks through; listings are descriptive, so "the
      // listing itself" doesn't help either (0.75-0.81). Asking for the agent's
      // own sales copy gives those drafts 0.14-0.20, real listings 0.77-0.91,
      // and a personal letter about the house 0.09.
      statement:
        'This text is the estate agent’s own sales copy for the house, rather than a description of such copy.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'disclose',
      kind: 'meter',
      text: 'someone was killed in this house. the listing has to make that clear.',
      hint: 'a reader should come away knowing a person was killed there. it doesn’t have to be the headline.',
      statement: 'The text makes clear that a person was killed in this property.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'upbeat',
      kind: 'meter',
      text: 'the agent must still be upbeat about the place.',
      hint: 'this is a sale, not a confession. the agent is excited about the house and wants you to be too.',
      statement: 'The writer is enthusiastic about the property.',
      // A public listing scores 0.85; the same copy addressed to the culprit
      // drops to 0.56-0.74, and the flat and grim controls sit at 0.13-0.23.
      // 0.5 leaves the player topping the enthusiasm back up after the turn
      // rather than grinding on it.
      direction: 'above',
      threshold: 0.5,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “died”, “dead”, “death”, “murder”, “kill”, “blood”, “body” or “police”.',
      hint: 'and nothing built on them. what happened still has to come through, without the words for it.',
      stems: ['die', 'dead', 'death', 'murder', 'kill', 'blood', 'bod', 'police'],
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 110 words.',
      hint: 'the whole listing, price included. every word counts now.',
      value: 110,
    },
    {
      id: 'reader',
      kind: 'meter',
      text: 'this listing is written for one particular reader, who has been inside the house before.',
      hint: 'not the public. one person, and they already know the rooms you’re describing.',
      statement:
        'This text is addressed to one specific reader who has been inside the property before, rather than to the general public.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'culprit',
      kind: 'meter',
      text: 'that reader is the person who did it.',
      hint: 'the buyer you’re writing to is the one responsible for what happened in the house. the listing should make that plain.',
      statement:
        'The text implies that the reader is the person responsible for the killing in this house.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'no-accusing',
      kind: 'meter',
      text: 'the agent must not say one critical word about the reader.',
      hint: 'no “you know what you did”. the agent is selling a house to a valued buyer and knows exactly who they are.',
      // "Accuses the reader" read the winks as accusations (0.33-0.66 on
      // drafts that never say it). "Says anything critical" scores 0.15-0.17 on
      // the winks and 0.92 on a draft that says "we both know who that was".
      statement: 'The writer says anything critical of the reader.',
      direction: 'below',
      threshold: 0.35,
    },
    {
      id: 'buyer',
      kind: 'meter',
      text: 'the agent must make clear they’d rather sell to this reader than to anyone else.',
      hint: 'say why this buyer, of all people, is the right one for this house.',
      // "Ends with an invitation to view" scored 0.96 on a plain listing that
      // ended "viewing recommended", so it was free. This one scores 0.95 with
      // the case made, 0.46 on the same draft without it, 0.10 on an innocent reader.
      statement:
        'The writer makes clear they would rather sell the house to this reader than to anyone else.',
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
