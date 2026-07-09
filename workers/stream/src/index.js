export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (url.pathname !== '/fast_stream') {
      return new Response('Not Found', { status: 404 });
    }

    const tokenParam = url.searchParams.get('token');
    if (!tokenParam) {
      return new Response('Missing Token', { status: 400 });
    }

    try {
      // 1. Decode Token
      const tokenString = atob(tokenParam);
      const payload = JSON.parse(tokenString);
      
      const { uuid, action, source, filename, expires, signature } = payload;

      // 2. Verify Action
      if (action !== 'stream') {
        return new Response('Forbidden: Invalid Action', { status: 403 });
      }

      // 3. Verify Expiration
      if (Date.now() / 1000 > expires) {
        return new Response('Forbidden: Token Expired', { status: 403 });
      }

      // 4. Verify HMAC-SHA256 Signature at Edge
      const expectedSigInput = `${uuid}:${expires}:stream:${env.SECRET_SALT}`;
      
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(env.SECRET_SALT),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
      );
      
      const expectedSignatureBuffer = await crypto.subtle.sign(
        "HMAC",
        keyMaterial,
        encoder.encode(expectedSigInput)
      );
      
      // Convert ArrayBuffer to Hex String
      const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (signature !== expectedSignatureHex) {
        return new Response('Unauthorized: Invalid Signature', { status: 401 });
      }

      // 5. Dynamic Zero-Copy Streaming Proxy
      const fetchHeaders = new Headers();
      const range = request.headers.get('Range');
      
      // CRITICAL: Forward Range header for seeking/scrubbing
      if (range) {
        fetchHeaders.set('Range', range);
      }

      const sourceResponse = await fetch(source, {
        headers: fetchHeaders
      });

      // Forward response chunk-by-chunk
      const responseHeaders = new Headers(sourceResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*'); // Or strict WP domain
      responseHeaders.set('Accept-Ranges', 'bytes');
      responseHeaders.set('Content-Type', 'video/mp4');

      return new Response(sourceResponse.body, {
        status: sourceResponse.status,
        statusText: sourceResponse.statusText,
        headers: responseHeaders
      });

    } catch (e) {
      console.error(e);
      return new Response('Internal Edge Error', { status: 500 });
    }
  },
};
