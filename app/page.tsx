import { AppRoot } from '@/components/app-root'
import { loadPublicFallback } from '@/lib/server/public-content'

/**
 * The home page is rendered on the server with the public content already in
 * it, then served from Vercel's cache. Any admin edit clears that cache (see
 * lib/server/public-content), so changes appear on the next visit; the hourly
 * revalidate is only a safety net.
 */
export const revalidate = 3600

export default async function Page() {
  return <AppRoot fallback={await loadPublicFallback()} />
}
