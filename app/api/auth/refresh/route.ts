import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value
  if (!refreshToken) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 })
  }

  const upstream = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const data = await upstream.json()
  if (!upstream.ok) {
    const response = NextResponse.json(data, { status: upstream.status })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }

  const response = NextResponse.json({ access: data.access })
  response.cookies.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
  if (data.refresh) {
    response.cookies.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  return response
}
