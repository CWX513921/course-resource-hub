const API_WORKER_URL = 'https://course-sharing-api.3105075752.workers.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      const targetUrl = `${API_WORKER_URL}${url.pathname}${url.search}`;
      const newHeaders = new Headers(request.headers);
      newHeaders.delete('host');

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    return env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
  },
};
