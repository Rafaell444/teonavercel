import type { ZodType } from 'zod'

import { requireAdmin } from '../auth'
import { compact, getOr404, listApi, newId, now } from '../data'
import { db } from '../firebase'
import { created, handle, json, noContent, parseBody, type Params } from '../http'

/**
 * Builds the standard admin-managed collection endpoints
 * (public list, admin create / patch / delete) for simple collections such
 * as testimonials and pillars. Keeps each route file to a few lines.
 */
export function simpleCollection<TCreate extends Record<string, unknown>>(options: {
  collection: string
  create: ZodType<TCreate>
  patch: ZodType<Partial<TCreate>>
  /** In-memory sort for the public list. */
  sort?: (a: Record<string, unknown>, b: Record<string, unknown>) => number
  /** Called after a document is deleted (e.g. to remove an uploaded file). */
  onDelete?: (doc: Record<string, unknown>) => Promise<void>
  /** Cached public list (lib/server/public-content); replaces the direct read. */
  list?: () => Promise<unknown[]>
  /** Called after every successful write, e.g. to empty that cache. */
  onChange?: () => void
}) {
  const col = () => db().collection(options.collection)
  const changed = () => options.onChange?.()

  const GET = handle(async () => {
    if (options.list) return json(await options.list())
    const items = await listApi(col())
    if (options.sort) items.sort(options.sort)
    return json(items)
  })

  const POST = handle(async (req) => {
    await requireAdmin(req)
    const body = await parseBody(req, options.create)
    const id = newId()
    await col().doc(id).set({ ...body, created_at: now() })
    changed()
    const { data } = await getOr404(options.collection, id)
    return created(data)
  })

  const PATCH = handle<Params<{ id: string }>>(async (req, { params }) => {
    await requireAdmin(req)
    const { id } = await params
    const { ref } = await getOr404(options.collection, id)
    const body = compact(await parseBody(req, options.patch))
    if (Object.keys(body).length) await ref.update(body)
    changed()
    const { data } = await getOr404(options.collection, id)
    return json(data)
  })

  const DELETE = handle<Params<{ id: string }>>(async (req, { params }) => {
    await requireAdmin(req)
    const { id } = await params
    const { ref, data } = await getOr404(options.collection, id)
    await ref.delete()
    changed()
    await options.onDelete?.(data)
    return noContent()
  })

  return { GET, POST, PATCH, DELETE }
}
