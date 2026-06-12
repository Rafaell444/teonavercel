import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const upstream = await fetch(`${API_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

export async function PATCH(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const upstream = await fetch(`${API_URL}/api/auth/me/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
