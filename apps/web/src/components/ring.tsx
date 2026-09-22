import { Check } from './icons'

// A small progress ring in the rule's colour. It fills as the draft gets
// closer to satisfying the rule and becomes a solid tick once it does.
export function Ring({
  progress,
  color,
  holds,
}: {
  progress: number
  color: string
  holds: boolean
}) {
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <span className="relative inline-grid size-6 shrink-0 place-items-center">
      <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="var(--hairline)" strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill={holds ? color : 'none'}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))}
          className="ease-out-soft transition-[stroke-dashoffset,fill] duration-700"
        />
      </svg>
      <Check
        className={`relative size-3 text-white transition-all duration-300 ${holds ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
      />
    </span>
  )
}
