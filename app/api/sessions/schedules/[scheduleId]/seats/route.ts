import { byNumber, listApi } from '@/lib/server/data'
import { assertId, handle, json, type Params } from '@/lib/server/http'
import { getScheduleOr404, seatsCol } from '@/lib/server/services/sessions'

/** Public: the seat map for a group date. */
export const GET = handle<Params<{ scheduleId: string }>>(async (req, { params }) => {
  const scheduleId = assertId((await params).scheduleId)
  await getScheduleOr404(scheduleId)
  const seats = await listApi(seatsCol(scheduleId))
  seats.sort(byNumber('seat_number'))
  return json(seats)
})
