import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { bucket } from './firebase'
import { badRequest } from './http'

/**
 * File uploads go to Firebase Storage. Each file gets a download token, so
 * the URL works without making the bucket public and cannot be guessed.
 */

const MAX_BYTES = 25 * 1024 * 1024

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

export type UploadFolder = 'hero' | 'events' | 'certificates' | 'vault'

export async function uploadFile(file: File, folder: UploadFolder, { imagesOnly = false } = {}): Promise<string> {
  if (file.size === 0) throw badRequest('The uploaded file is empty.')
  if (file.size > MAX_BYTES) throw badRequest('The file is larger than 25 MB.')
  if (imagesOnly && !file.type.startsWith('image/')) throw badRequest('Only image files are allowed here.')

  const original = path.basename(file.name || 'file').replace(/[^\w.-]+/g, '-').slice(0, 80)
  const ext = original.includes('.') ? '' : `.${EXTENSION_BY_TYPE[file.type] ?? 'bin'}`
  const key = `${folder}/${randomUUID().slice(0, 8)}-${original}${ext}`
  const token = randomUUID()

  const b = bucket()
  await b.file(key).save(Buffer.from(await file.arrayBuffer()), {
    resumable: false,
    contentType: file.type || 'application/octet-stream',
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  })
  const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST
    ? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
    : 'https://firebasestorage.googleapis.com'
  return `${host}/v0/b/${b.name}/o/${encodeURIComponent(key)}?alt=media&token=${token}`
}

/** Best-effort removal of a file we uploaded earlier. Never throws. */
export async function deleteFile(url: string | null | undefined) {
  if (!url) return
  try {
    const match = /\/o\/([^?]+)/.exec(url)
    if (!match) return
    await bucket().file(decodeURIComponent(match[1])).delete({ ignoreNotFound: true })
  } catch {
    // the record is already gone; a leftover file is not worth failing the request
  }
}
