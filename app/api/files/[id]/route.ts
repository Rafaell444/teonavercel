import { requireUser } from '@/lib/server/auth'
import { assertId, handle, notFound, type Params } from '@/lib/server/http'
import { readFile } from '@/lib/server/storage'

/**
 * Serves a file uploaded through the admin panel (see lib/server/storage.ts).
 * Ids are random, and the bytes never change for a given id, so public files
 * are cached for a year by browsers and the Vercel CDN. Vault files are only
 * for signed-in members and are not cached on the CDN.
 */
export const GET = handle<Params<{ id: string }>>(async (req, { params }) => {
  const id = assertId((await params).id)
  const file = await readFile(id)
  if (!file) throw notFound('File not found.')
  const isVault = file.meta.folder === 'vault'
  if (isVault) await requireUser(req)

  const body = new Uint8Array(file.data.buffer, file.data.byteOffset, file.data.byteLength)
  return new Response(body, {
    headers: {
      'content-type': file.meta.content_type,
      'content-length': String(file.meta.size),
      'content-disposition': `inline; filename="${file.meta.name}"`,
      'cache-control': isVault ? 'private, max-age=3600' : 'public, max-age=31536000, s-maxage=31536000, immutable',
      etag: `"${id}"`,
    },
  })
})
