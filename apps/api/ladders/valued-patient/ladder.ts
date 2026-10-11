import type { LadderFile } from '../../src/ladder/file'

// Valued Patient. A hospital's letter to a patient after a surgical mix-up.
//
// The form's one essential move is banned. An apology letter has to apologise;
// rule 3 takes away every word that does it and rule 5 forbids taking the
// blame at all, while rule 4 insists the patient still feels looked after.
// What's left is the customer-service register with nothing to hold it up,
// so the specifics have to carry it: what was taken, where it is now, the
// bright side, and a request to rate the stay out of five.
//
// The hard meter is blame. "The hospital accepts responsibility" scored 0.53
// to 0.66 on letters that merely stated the facts in the passive voice, which
// is exactly the letter the ladder wants. Asking whether the letter avoids
// saying the hospital was at fault separates those (0.83 to 0.89) from a real
// apology (0.01).

export default {
  id: 'valued-patient',
  title: 'valued patient',
  date: '2026-10-15',
  hints: [
    'write the honest letter first, the one that says sorry. you’ll be taking words out of it, not starting over.',
    'the passive voice is your friend. a kidney was removed. nobody removed it.',
    'the part has to be somewhere. the hospital knows exactly where, and is pleased with how it’s being kept.',
    'the rating request goes at the end in the same voice as everything else. don’t play it as a joke. it already is one.',
  ],
  rules: [
    {
      id: 'form',
      kind: 'meter',
      text: 'this is a letter from a hospital to a patient.',
      hint: 'on headed paper, from the hospital to the person it treated, about their stay.',
      // "Written in the form of a letter" scored 0.96 on a draft that merely
      // restated the rules in the third person. Asking for the letter itself
      // drops that to 0.24 and keeps real letters at 0.92 to 0.97.
      statement:
        'This text is the letter itself, written by the hospital to the patient, rather than a description of one.',
      direction: 'above',
      threshold: 0.7,
    },
    {
      id: 'mixup',
      kind: 'meter',
      text: 'the letter is about an operation that went wrong.',
      hint: 'the wrong procedure, the wrong patient or the wrong part of the right patient. the letter has to be about that.',
      // "Concerns a surgical error" fell to 0.63 on a terse letter that never
      // calls it an error, which is the letter this ladder asks for. "Mix-up"
      // holds that one at 0.78, the rest at 0.90 to 0.97, and an appointment
      // letter at 0.01.
      statement: 'This letter is about a surgical mix-up.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'banned',
      kind: 'forbid',
      text: 'no “sorry”, “apologise”, “regret”, “mistake”, “error”, “wrong”, “fault” or “unfortunately”.',
      hint: 'and nothing built on them: no apology, no errors, no regrettably. the letter still has to be about what happened.',
      stems: ['sorry', 'apolog', 'regret', 'mistake', 'error', 'wrong', 'fault', 'unfortunate'],
    },
    {
      id: 'care',
      kind: 'meter',
      text: 'the patient must feel looked after.',
      hint: 'warm, attentive and interested in how they are doing. a letter from people who care.',
      // "Would feel cared for" sat at 0.31 to 0.49 on the letters this ladder
      // wants. "Attentive to how the patient is doing" scores 0.82 to 0.86 on
      // them, 0.06 on a legal-department letter, 0.09 on a terse one that
      // takes responsibility and nothing else, 0.33 on a 27-word "we care".
      statement: 'The letter is attentive to how the patient is doing.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'blame',
      kind: 'meter',
      text: 'the hospital must not take the blame.',
      hint: 'nothing in the letter can say the hospital did this. things happened; nobody did them.',
      statement: 'The letter avoids saying that the hospital was at fault.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'where',
      kind: 'meter',
      text: 'the letter must say where the part in question is now.',
      hint: 'the organ, the limb, the implant, whatever was removed, added or swapped. the patient will want to know where it went.',
      // 0.92 to 0.94 when the letter says the kidney has been retained, 0.18
      // when that line is cut. "What has become of" let the cut version
      // through at 0.74.
      statement: 'The letter says where the removed body part or misplaced item is now.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'bright',
      kind: 'meter',
      text: 'the letter must find something about all this to be pleased about.',
      hint: 'a silver lining, reported sincerely. there is always one.',
      // 0.95 on letters that praise the condition of the organ, 0.04 to 0.06
      // on an honest apology.
      statement: 'The letter finds something to be positive about.',
      direction: 'above',
      threshold: 0.6,
    },
    {
      id: 'rate',
      kind: 'meter',
      text: 'the letter must ask the patient to rate their experience.',
      hint: 'a score out of five, a survey, a quick questionnaire. how did we do.',
      statement: 'The text asks the recipient to rate or review their experience.',
      // 0.98 to 0.99 with the request, 0.01 to 0.02 without.
      direction: 'above',
      threshold: 0.6,
    },
  ],
} as const satisfies LadderFile
