import type { LadderFile } from '../../src/ladder/file'

// The Year In Review. A family's end-of-year newsletter, written by someone
// who thinks it was a good year.
//
// The joke is an oblivious narrator. Rule 2 puts the family in trouble, rule 3
// makes the writer delighted about it, and rule 4 is the lock: the writer may
// never say what is wrong, so the reader has to work it out from the details
// (the garage, the age of the boyfriend, how many fire departments know the
// boy by name). The rungs after that keep the newsletter's rituals, the
// thank-you, the plans, the comparison with last year, each of which now
// lands as evidence.
//
// Jev cannot tell a sincere narrator from a winking one by being asked about
// sincerity: "the writer is being ironic" scored 0.95 on both. It can tell
// whether the bad news is stated or only implied, and that turns out to be the
// same line, so rule 4 asks that.

export default {
  id: 'the-year-in-review',
  title: 'the year in review',
  date: '2026-10-18',
  hints: [
    'write a real family newsletter first, with four people in it. then start taking things away from them.',
    'the writer has a reason why each bad thing is good. the garage has always been his favourite room.',
    'details do the work. the number of fire departments, the age of the boyfriend, who has the bank card.',
    'the thank-you is where the reader finds out who has really been in the house this year.',
    'if this was the better year, the reader will wonder about the other one. let them.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a family’s end-of-year newsletter.',
      hint: 'the letter in the holiday card: what everyone in the family got up to this year.',
      // "Written in the form of a newsletter" scored 0.97 on a draft that
      // restated the rules in the third person. Asking for the newsletter
      // itself drops that to 0.19 and keeps real ones at 0.83 to 0.94, though
      // it dips as the content darkens, so 0.6 rather than 0.7.
      statement:
        'This text is the newsletter itself, written by a member of the family, rather than a description of one.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'trouble',
      kind: 'meter',
      text: 'the family must be falling apart, and the reader must be able to tell.',
      hint: 'money, marriage, the kids, health. something real is going badly for these people.',
      // 0.93 to 0.98 whenever the facts are bad, however they are told; 0.01
      // on a genuinely happy newsletter.
      statement: 'A reader can tell that this family is in serious trouble.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'upbeat',
      kind: 'meter',
      text: 'the writer must be delighted with how the year went.',
      hint: 'every single item is good news to whoever is writing this. no wistful notes.',
      // "Presents every item as good news" sat at 0.65 on the best oblivious
      // draft because Jev can see the news is bad. Asking only about tone
      // scores 0.82 there, 0.16 on gallows humour and 0.01 on a sad letter.
      statement: 'The writer’s tone is upbeat.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'implied',
      kind: 'meter',
      text: 'the writer must never say what’s actually wrong. the reader has to work it out.',
      hint: 'no naming the problem. someone has moved into the garage; nobody has separated. the writer doesn’t think there is a problem to name.',
      // 0.92 on the oblivious draft, 0.45 on the same facts told bluntly but
      // cheerfully, 0.54 on gallows humour, 0.07 on a happy letter with
      // nothing to hide.
      statement:
        'The reader has to work out what has gone wrong, because the writer never says so.',
      direction: 'above',
      threshold: 0.65,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “blessed”, “proud”, “grateful”, “exciting”, “journey”, “adventure”, “wonderful” or “busy”.',
      hint: 'the newsletter words are gone, and anything built on them. be pleased in specifics.',
      stems: ['blessed', 'proud', 'grateful', 'excit', 'journey', 'adventure', 'wonderful', 'busy'],
    },
    {
      id: 'short',
      kind: 'maxWords',
      text: 'keep it under 150 words.',
      hint: 'everyone still gets a mention. the mentions get shorter.',
      value: 150,
    },
    {
      id: 'thanks',
      kind: 'meter',
      text: 'someone outside the family must get a thank-you.',
      hint: 'a neighbour, an officer, a counsellor, a very patient bank manager. thanked by name, like a friend.',
      // 0.96 to 0.98 with a named outsider thanked, 0.01 to 0.02 without.
      statement: 'The text thanks a person outside the family for their help this year.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'plans',
      kind: 'meter',
      text: 'it must say what the family is planning for next year.',
      hint: 'the usual closing paragraph: what’s coming up. the writer is looking forward to it.',
      statement: 'The text describes the family’s plans for the coming year.',
      // 0.82 to 0.92 with a plans paragraph, 0.14 to 0.31 without.
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'better',
      kind: 'meter',
      text: 'the writer must say this year was better than last year.',
      hint: 'a comparison with the previous year, in the family’s favour. think about what that says about last year.',
      statement: 'The text compares this year favourably with the previous one.',
      // 0.79 to 0.98 with the comparison, 0.02 without.
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
