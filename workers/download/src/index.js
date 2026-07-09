export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://blog.calculixpro.in',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (url.pathname !== '/download') {
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
      if (action !== 'download') {
        return new Response('Forbidden: Invalid Action', { status: 403 });
      }

      // 3. Verify Expiration
      if (Date.now() / 1000 > expires) {
        return new Response('Forbidden: Token Expired', { status: 403 });
      }

      // 4. Verify HMAC-SHA256 Signature at Edge
      const expectedSigInput = `${uuid}:${expires}:download:${env.SECRET_SALT}`;
      
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
      
      const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (signature !== expectedSignatureHex) {
        return new Response('Unauthorized: Invalid Signature', { status: 401 });
      }

      // 5. Background fetch and force download
      const sourceResponse = await fetch(source);

      if (!sourceResponse.ok) {
        return new Response('Failed to retrieve source file', { status: 502 });
      }

      // Forward response chunk-by-chunk with download headers
      const responseHeaders = new Headers(sourceResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', 'https://blog.calculixpro.in');
      responseHeaders.set('Content-Type', 'application/octet-stream');
      
      // Ensure safe filename parsing
      const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_') || 'download.mp4';
      responseHeaders.set('Content-Disposition', `attachment; filename="${safeFilename}"`);

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
