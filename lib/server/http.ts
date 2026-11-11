import { NextResponse } from 'next/server'
import { ZodError, type ZodType } from 'zod'

/**
 * Helpers shared by every route handler. Error bodies keep the shape the
 * previous backend used ({ detail } or { field: ["message"] }) because the
 * frontend's getErrorMessage() already understands it.
 */

export class HttpError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(typeof body === 'string' ? body : `HTTP ${status}`)
    this.status = status
    this.body = typeof body === 'string' ? { detail: body } : body
  }
}

export const notFound = (what = 'Not found.') => new HttpError(404, what)
export const badRequest = (what: string) => new HttpError(400, what)
export const unauthorized = (what = 'Authentication credentials were not provided.') => new HttpError(401, what)
export const forbidden = (what = 'You do not have permission to perform this action.') => new HttpError(403, what)
export const conflict = (what: string) => new HttpError(409, what)

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init)
}
export const created = (data: unknown) => json(data, 201)
export const noContent = () => new NextResponse(null, { status: 204 })

/** Route params arrive as a Promise in Next 15+. */
export type Params<T extends Record<string, string>> = { params: Promise<T> }

/** Wraps a handler so thrown HttpError / ZodError become proper responses. */
export function handle<Ctx = unknown>(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx)
    } catch (err) {
      if (err instanceof HttpError) return json(err.body, err.status)
      if (err instanceof ZodError) return json(zodToFieldErrors(err), 400)
      if (isAlreadyExists(err)) return json({ detail: 'This record already exists.' }, 409)
      console.error('[api]', req.method, new URL(req.url).pathname, err)
      const message = err instanceof Error && /FIREBASE_|is not set/.test(err.message) ? err.message : 'Server error. Please try again.'
      return json({ detail: message }, 500)
    }
  }
}

/** Firestore `create()` on an existing document. */
function isAlreadyExists(err: unknown) {
  return typeof err === 'object' && err !== null && (err as { code?: number | string }).code === 6
}

function zodToFieldErrors(err: ZodError) {
  const out: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join('.') : 'non_field_errors'
    ;(out[key] ??= []).push(issue.message)
  }
  return out
}

/**
 * Reads the request body as an object, from JSON or from a multipart form.
 * Multipart text fields come back as strings; files as File objects.
 */
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get('content-type') ?? ''
  if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData()
    const out: Record<string, unknown> = {}
    for (const [key, value] of form.entries()) {
      if (typeof value !== 'string') {
        // A file part (checked by shape: the File global is missing on Node < 20)
        if (value.size > 0) out[key] = value
      } else if (key in out) {
        const existing = out[key]
        out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
      } else {
        out[key] = value
      }
    }
    return out
  }
  const text = await req.text()
  if (!text.trim()) return {}
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    throw badRequest('Request body is not valid JSON.')
  }
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  return schema.parse(await readBody(req))
}

export const query = (req: Request) => new URL(req.url).searchParams

/** Document ids must be plain path-safe strings. */
export function assertId(value: string): string {
  if (!value || value.length > 128 || /[\/\s]/.test(value) || value === '.' || value === '..') throw notFound()
  return value
}
