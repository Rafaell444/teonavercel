/**
 * Feature flags shared by the pages and the API.
 *
 * Payments: the site currently takes no payment online. Members pick a date
 * and time, the booking is created as a *request* (status "Pending"), and the
 * coach confirms it in the admin panel after arranging payment directly.
 * Set NEXT_PUBLIC_PAYMENTS_ENABLED=true to bring back the "Confirm & Pay"
 * wording, the voucher step and immediate confirmation of group seats.
 */
export const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true'
