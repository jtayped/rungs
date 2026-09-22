import type { RuleView } from '~/lib/use-ladder'
import { hue } from '~/lib/palette'

// One segment per rule. Revealed rules show in their own colour, solid while
// they hold and faded when they don't; the newest one is wider. Rules still to
// come stay grey, so you always know how far there is to go and never what.
export function Progress({ rules, total }: { rules: RuleView[]; total: number }) {
  const current = rules.length - 1
  return (
    <ol className="flex items-center gap-1.5" aria-label={`rule ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const rule = rules[i]
        const width = i === current ? 'w-6' : 'w-2'
        return (
          <li
            key={i}
            className={`ease-out-soft h-2 rounded-full transition-all duration-500 ${width}`}
            style={{
              backgroundColor: rule ? hue(i) : 'var(--hairline)',
              opacity: !rule || rule.state === 'holds' ? 1 : 0.32,
            }}
          />
        )
      })}
    </ol>
  )
}
