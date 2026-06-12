import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function proxyToBackend(req: NextRequest) {
  const url = new URL(req.url)
  const backendPath = url.pathname + url.search
  const backendUrl = `${BACKEND_URL}${backendPath}`

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    if (key !== 'host' && key !== 'connection' && key !== 'accept-encoding') {
      headers.set(key, value)
    }
  })

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body
    // @ts-expect-error duplex is needed for streaming body
    init.duplex = 'half'
  }

  const upstream = await fetch(backendUrl, init)

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (
      key !== 'transfer-encoding' &&
      key !== 'connection' &&
      key !== 'content-encoding' &&
      key !== 'content-length'
    ) {
      responseHeaders.set(key, value)
    }
  })

  // Node's fetch auto-decompresses the body, so we read it as text and
  // return it uncompressed to avoid ERR_CONTENT_DECODING_FAILED in the browser
  const body = await upstream.text()

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const GET = proxyToBackend
export const POST = proxyToBackend
export const PUT = proxyToBackend
export const PATCH = proxyToBackend
export const DELETE = proxyToBackend
export const OPTIONS = proxyToBackend
