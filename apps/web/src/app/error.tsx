'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-6 px-6">
      <p className="text-muted text-[19px] leading-[1.45] tracking-[-0.012em]">
        the judge is unavailable right now.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-ink text-ground h-12 rounded-full px-7 text-[17px] font-semibold transition-transform active:scale-[0.97]"
      >
        try again
      </button>
    </main>
  )
}
