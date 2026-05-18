export async function onRequest(context) {
  const url = new URL(context.request.url)
  const targetUrl = `https://course-sharing-api.3105075752.workers.dev/api/v1${url.pathname.replace('/api/v1', '')}${url.search}`

  const newHeaders = new Headers(context.request.headers)
  newHeaders.delete('host')

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: newHeaders,
    body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined,
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.set('Access-Control-Allow-Origin', '*')
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
