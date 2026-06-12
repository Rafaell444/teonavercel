import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (refreshToken && accessToken) {
    await fetch(`${API_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh: refreshToken }),
    }).catch(() => {})
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}
