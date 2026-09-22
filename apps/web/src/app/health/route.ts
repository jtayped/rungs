// The deploy waits for this to report the commit it just built. It sits
// outside /api so it answers for the web app, not the API behind the rewrite.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ ok: true, commit: process.env.RUNGS_COMMIT ?? 'dev' })
}
