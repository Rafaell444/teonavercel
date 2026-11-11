import { COLLECTIONS, newId, now } from './data'
import { db } from './firebase'

/**
 * Notifications. Every message is written to the notificationLogs collection
 * (visible in the Firebase console). Email is sent through Resend when
 * RESEND_API_KEY is set; otherwise it is only logged. SMS is logged only, as
 * in the previous backend (no SMS provider was ever connected).
 */

const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || ''
const FROM_EMAIL = () => process.env.EMAIL_FROM || 'TEONA <onboarding@resend.dev>'
const ADMIN_PHONE = () => process.env.ADMIN_PHONE || ''

type Kind = 'sms' | 'email' | 'calendar_invite'

async function log(entry: { type: Kind; recipient: string; subject?: string; body: string; status: 'sent' | 'failed' | 'skipped'; booking_id?: string | null }) {
  try {
    await db().collection(COLLECTIONS.notifications).doc(newId()).set({
      notification_type: entry.type,
      recipient: entry.recipient,
      subject: entry.subject ?? '',
      body: entry.body,
      status: entry.status,
      booking_id: entry.booking_id ?? null,
      sent_at: entry.status === 'sent' ? now() : null,
      created_at: now(),
    })
  } catch (err) {
    console.error('[notifications] could not write log', err)
  }
}

export async function sendEmail(to: string, subject: string, body: string, bookingId?: string | null) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) {
    console.info(`[email skipped] to=${to} subject=${subject}`)
    await log({ type: 'email', recipient: to, subject, body, status: 'skipped', booking_id: bookingId })
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL(), to: [to], subject, text: body }),
    })
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
    await log({ type: 'email', recipient: to, subject, body, status: 'sent', booking_id: bookingId })
  } catch (err) {
    console.error('[email failed]', err)
    await log({ type: 'email', recipient: to, subject, body, status: 'failed', booking_id: bookingId })
  }
}

async function logSms(message: string, bookingId?: string | null) {
  console.info(`[sms] to=${ADMIN_PHONE() || '(no ADMIN_PHONE)'} ${message}`)
  await log({ type: 'sms', recipient: ADMIN_PHONE() || 'admin', body: message, status: 'skipped', booking_id: bookingId })
}

export interface BookingForNotify {
  id: string
  user_name: string
  user_email: string
  session_title: string
  num_sessions: number
  format: string
  date: string
  time: string
  total: number
  expires_at: string | null
  meet_link: string
}

export async function notifyBookingCreated(b: BookingForNotify) {
  await logSms(
    `New booking! ${b.user_name || b.user_email} booked '${b.session_title}' (${b.num_sessions} sessions, ${b.format}). Date: ${b.date}, Time: ${b.time}. Total: $${b.total}`,
    b.id,
  )
  const lines = [
    `Hi ${b.user_name || b.user_email},`,
    '',
    `Your booking for '${b.session_title}' has been confirmed.`,
    '',
    `Sessions: ${b.num_sessions}`,
    `First session: ${b.date} at ${b.time}`,
    `Format: ${b.format === 'online' ? 'Online' : 'In-Person'}`,
    `Total: $${b.total}`,
  ]
  if (b.expires_at) lines.push(`Valid until: ${new Date(b.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
  if (b.meet_link) lines.push('', `Google Meet link: ${b.meet_link}`)
  lines.push('', 'Thank you for choosing TEONA!')
  await sendEmail(b.user_email, `Booking Confirmed — ${b.session_title}`, lines.join('\n'), b.id)
}

export async function notifySessionScheduled(b: BookingForNotify, s: { session_number: number; date: string | null; time: string | null; format: string; meet_link: string }, location?: { name: string; maps: string }) {
  await logSms(`Session #${s.session_number} scheduled! ${b.user_name || b.user_email} — '${b.session_title}' on ${s.date} at ${s.time} (${s.format})`, b.id)
  const body =
    s.format === 'offline'
      ? `Calendar Invite for: ${b.session_title}\nDate: ${s.date}\nTime: ${s.time}\nLocation: ${location?.name || 'Tbilisi, Georgia'}\nGoogle Maps: ${location?.maps || ''}`
      : `Calendar Invite for: ${b.session_title}\nDate: ${s.date}\nTime: ${s.time}\nFormat: Online\nMeet Link: ${s.meet_link}`
  await log({ type: 'calendar_invite', recipient: b.user_email, subject: `Session: ${b.session_title}`, body, status: 'skipped', booking_id: b.id })
  await sendEmail(b.user_email, `Session #${s.session_number} scheduled — ${b.session_title}`, body, b.id)
}

export async function notifyAdminNewMessage(m: { name: string; email: string; subject: string; message: string }) {
  if (!ADMIN_EMAIL()) return
  await sendEmail(ADMIN_EMAIL(), `[TEONA] New contact: ${m.subject}`, `From: ${m.name} <${m.email}>\n\n${m.message}`)
}
