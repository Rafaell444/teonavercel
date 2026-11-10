import { type App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, Timestamp, getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

/**
 * Firebase Admin SDK, shared by every API route.
 *
 * Environment variables (see .env.example):
 *   FIREBASE_SERVICE_ACCOUNT  — the service-account JSON (raw or base64-encoded)
 *   FIREBASE_WEB_API_KEY      — the project's Web API key (used for email/password sign-in)
 *   FIREBASE_STORAGE_BUCKET   — optional; defaults to the project's default bucket
 *
 * Local development can use the Firebase Emulator Suite instead of a real
 * project (`firebase emulators:start`): when FIRESTORE_EMULATOR_HOST is set no
 * service account is needed, and GCLOUD_PROJECT names the demo project.
 */

/** True when the Firebase emulators are being used instead of a real project. */
export const usingEmulators = () => !!process.env.FIRESTORE_EMULATOR_HOST

interface ServiceAccount {
  project_id: string
  client_email: string
  private_key: string
}

function readServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT is not set. Paste the service-account JSON from Firebase console → Project settings → Service accounts.',
    )
  }
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  const parsed = JSON.parse(text) as ServiceAccount
  // Vercel's dashboard stores "\n" in private keys literally; put real newlines back
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
  return parsed
}

const globalForFirebase = globalThis as unknown as { __ascendFirebase?: App }

export function firebaseApp(): App {
  if (globalForFirebase.__ascendFirebase) return globalForFirebase.__ascendFirebase
  const existing = getApps()[0]
  if (existing) return (globalForFirebase.__ascendFirebase = existing)
  if (usingEmulators()) {
    const projectId = process.env.GCLOUD_PROJECT || 'demo-ascend'
    const app = initializeApp({ projectId, storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com` })
    globalForFirebase.__ascendFirebase = app
    return app
  }
  const account = readServiceAccount()
  const app = initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
    projectId: account.project_id,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${account.project_id}.firebasestorage.app`,
  })
  globalForFirebase.__ascendFirebase = app
  return app
}

let firestore: Firestore | undefined
export function db(): Firestore {
  if (!firestore) {
    firestore = getFirestore(firebaseApp())
    firestore.settings({ ignoreUndefinedProperties: true })
  }
  return firestore
}

export const auth = () => getAuth(firebaseApp())
export const bucket = () => getStorage(firebaseApp()).bucket()

export { FieldValue, Timestamp }

export function webApiKey(): string {
  const key = process.env.FIREBASE_WEB_API_KEY
  if (usingEmulators()) return key || 'emulator'
  if (!key) {
    throw new Error('FIREBASE_WEB_API_KEY is not set. Copy the Web API key from Firebase console → Project settings → General.')
  }
  return key
}
