/**
 * Deployment health check: GET /api/health
 *
 * Imports nothing from the server library at module scope on purpose, so it
 * still answers when that library fails to load, and reports why. It never
 * reveals secret values, only whether they are set.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    FIREBASE_SERVICE_ACCOUNT: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
    FIREBASE_WEB_API_KEY: Boolean(process.env.FIREBASE_WEB_API_KEY),
    NEXT_PUBLIC_PAYMENTS_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED ?? '(unset)',
  }
  const checks: Record<string, string> = {}

  try {
    const firebase = await import('@/lib/server/firebase')
    checks.firebase_module = 'ok'
    try {
      firebase.firebaseApp()
      checks.firebase_app = 'ok'
      const snap = await firebase.db().collection('settings').doc('site').get()
      checks.firestore = snap.exists ? 'ok (settings/site found)' : 'connected, but settings/site is missing (run pnpm seed)'
    } catch (err) {
      checks.firebase_app = `error: ${err instanceof Error ? err.message : String(err)}`
    }
  } catch (err) {
    checks.firebase_module = `failed to load: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`
  }

  try {
    await import('@/lib/server/storage')
    checks.storage_module = 'ok'
  } catch (err) {
    checks.storage_module = `failed to load: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`
  }

  return Response.json({
    ok: Object.values(checks).every((v) => v.startsWith('ok')),
    node: process.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    region: process.env.VERCEL_REGION ?? null,
    env,
    checks,
  })
}
