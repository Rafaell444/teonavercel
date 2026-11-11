import { randomUUID } from 'node:crypto'
import path from 'node:path'

import sharp from 'sharp'

import { COLLECTIONS, now } from './data'
import { db } from './firebase'
import { badRequest } from './http'

/**
 * File uploads live in Firestore, so the site needs no Firebase Storage
 * bucket (which requires a billing account). A file is one document in the
 * `files` collection plus a `chunks` subcollection: Firestore documents are
 * limited to 1 MiB, so the bytes are split into chunks a little under that.
 *
 * Files are served by GET /api/files/{id}. Ids are random UUIDs, so a URL
 * cannot be guessed; vault files additionally require a signed-in member.
 *
 * Images are converted to WebP and capped at 1920px, which keeps a hero
 * image around 100–300 KB (one chunk). Firestore's free plan stores 1 GiB,
 * enough for hundreds of images and documents.
 */

const MAX_BYTES = 25 * 1024 * 1024
/** Below Firestore's 1 MiB document limit with room for the field overhead */
const CHUNK_BYTES = 900 * 1024
const MAX_IMAGE_WIDTH = 1920
const WEBP_QUALITY = 82

export const FILES_ROUTE = '/api/files'

export type UploadFolder = 'hero' | 'events' | 'certificates' | 'vault'

export interface StoredFileMeta {
  name: string
  content_type: string
  size: number
  folder: UploadFolder
  chunk_count: number
  created_at: unknown
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'audio/mpeg': 'mp3',
  'video/mp4': 'mp4',
}

/** Formats sharp can re-encode; SVG and GIF (animation) are kept as they are */
const COMPRESSIBLE_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif', 'image/heic'])

export const filesCol = () => db().collection(COLLECTIONS.files)

export async function uploadFile(file: File, folder: UploadFolder, { imagesOnly = false } = {}): Promise<string> {
  if (file.size === 0) throw badRequest('The uploaded file is empty.')
  if (file.size > MAX_BYTES) throw badRequest('The file is larger than 25 MB.')
  if (imagesOnly && !file.type.startsWith('image/')) throw badRequest('Only image files are allowed here.')

  let buffer: Buffer = Buffer.from(await file.arrayBuffer())
  let contentType = file.type || 'application/octet-stream'
  let name = path.basename(file.name || 'file').replace(/[^\w.-]+/g, '-').slice(0, 80)
  if (!name.includes('.')) name += `.${EXTENSION_BY_TYPE[contentType] ?? 'bin'}`

  if (COMPRESSIBLE_IMAGES.has(contentType)) {
    try {
      buffer = await sharp(buffer).rotate().resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer()
      contentType = 'image/webp'
      name = name.replace(/\.[^.]+$/, '') + '.webp'
    } catch {
      // Not a decodable image after all: keep the original bytes
    }
  }

  const id = randomUUID()
  const ref = filesCol().doc(id)
  const chunks: Buffer[] = []
  for (let offset = 0; offset < buffer.length; offset += CHUNK_BYTES) {
    chunks.push(buffer.subarray(offset, offset + CHUNK_BYTES))
  }
  // Each chunk is its own write: a single batch may not exceed 10 MiB
  await Promise.all(chunks.map((data, index) => ref.collection('chunks').doc(String(index)).set({ data })))
  const meta: StoredFileMeta = { name, content_type: contentType, size: buffer.length, folder, chunk_count: chunks.length, created_at: now() }
  await ref.set(meta)
  return `${FILES_ROUTE}/${id}`
}

/** Reads a stored file back as one buffer, or null when it does not exist. */
export async function readFile(id: string): Promise<{ meta: StoredFileMeta; data: Buffer } | null> {
  const ref = filesCol().doc(id)
  const snap = await ref.get()
  if (!snap.exists) return null
  const meta = snap.data() as StoredFileMeta
  const parts = await Promise.all(
    Array.from({ length: meta.chunk_count }, (_, index) => ref.collection('chunks').doc(String(index)).get()),
  )
  const buffers = parts.map((part) => {
    const data = part.get('data') as Buffer | Uint8Array | undefined
    if (!data) throw new Error(`File ${id} is missing chunk ${part.id}.`)
    return Buffer.isBuffer(data) ? data : Buffer.from(data)
  })
  return { meta, data: Buffer.concat(buffers) }
}

export const fileIdFromUrl = (url: string): string | null => {
  const match = new RegExp(`^${FILES_ROUTE}/([0-9a-f-]{36})$`).exec(url)
  return match ? match[1] : null
}

/** Best-effort removal of a file we uploaded earlier. Never throws. */
export async function deleteFile(url: string | null | undefined) {
  if (!url) return
  const id = fileIdFromUrl(url)
  if (!id) return
  try {
    await db().recursiveDelete(filesCol().doc(id))
  } catch {
    // the record is already gone; a leftover file is not worth failing the request
  }
}
