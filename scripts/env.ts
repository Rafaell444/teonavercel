/**
 * Loads .env.local (then .env) into process.env for the scripts in this
 * folder, the same files Next.js reads. Existing variables are not overridden.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

for (const name of ['.env.local', '.env']) {
  const file = path.join(process.cwd(), name)
  if (!existsSync(file)) continue
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}
