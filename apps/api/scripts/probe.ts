// Tuning harness for new rules. Race candidate STATEMENTS against texts that
// should pass and texts that should not, and keep the one with the widest gap.
// Always include a control that must score LOW, or you will ship a rule that
// says yes to everything.
//
//   pnpm --filter @rungs/api probe
// Only the gateway key is needed here, not the api's full env.
process.env.AI_GATEWAY_API_KEY ||= process.env.VERCEL_AI_GATEWAY_API_KEY
import { jev } from '../src/jev'

const TEXTS: Record<string, string> = {
  // should pass: ends by releasing the room
  warm:
    'My funeral, my eulogy. I did not trust anyone else to tell the truth. I was difficult for ' +
    'most of my life and I knew it while I was doing it. None of that was your failing. Put it ' +
    'down on your way out. Please.',
  // control: same setup, no grace at the end
  bleak:
    'My funeral, my eulogy. I was difficult for most of my life and I knew it while I was doing ' +
    'it. That is the whole of it. There is nothing else to say and no reason to stay.',
}

const CANDIDATES: Record<string, string> = {
  a: 'This text would be a comfort to someone who heard it.',
  b: 'This text releases the listener from guilt or obligation.',
  c: 'This text ends with an act of generosity toward the listener.',
}

for (const [name, text] of Object.entries(TEXTS)) {
  const p = await jev(text, CANDIDATES)
  const row = Object.keys(CANDIDATES).map((k) => `${k}=${(p[k] ?? 0).toFixed(2)}`)
  console.log(`${name.padEnd(8)} ${row.join('  ')}`)
}
console.log('')
for (const [k, v] of Object.entries(CANDIDATES)) console.log(`  ${k}: ${v}`)
