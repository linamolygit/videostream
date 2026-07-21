export default {
  async fetch(request, env, ctx) {
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

    const url = new URL(request.url);
    if (url.pathname !== '/fast_stream') {
      return new Response('Not Found', { status: 404 });
    }

    const tokenParam = url.searchParams.get('token');
    if (!tokenParam) {
      return new Response('Missing Token', { status: 400 });
    }

    const SECRET_SALT = env.SECRET_SALT || "enterprise_super_secret_salt_123";

    try {
      // 1. Base64URL Decode
      let combinedStr = "";
      try {
        const base64 = tokenParam.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
        combinedStr = atob(paddedBase64);
      } catch (e) {
        return new Response("Malformed token base64 format.", { status: 400 });
      }

      const parts = combinedStr.split(":");
      if (parts.length !== 2) {
        return new Response("Invalid token structure.", { status: 400 });
      }

      const ivHex = parts[0];
      const ciphertextHex = parts[1];

      const hexToBytes = (hex) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
      };

      const iv = hexToBytes(ivHex);
      const ciphertext = hexToBytes(ciphertextHex);

      // 2. AES-256-CBC Decryption via Web Crypto
      const encoder = new TextEncoder();
      const saltBuffer = encoder.encode(SECRET_SALT);
      const keyHash = await crypto.subtle.digest("SHA-256", saltBuffer);

      const aesKey = await crypto.subtle.importKey(
        "raw",
        keyHash,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
      );

      let decryptedBuffer;
      try {
        decryptedBuffer = await crypto.subtle.decrypt(
          { name: "AES-CBC", iv: iv },
          aesKey,
          ciphertext
        );
      } catch (e) {
        return new Response("Token decryption failed. Key mismatch or corrupted payload.", { status: 401 });
      }

      const decoder = new TextDecoder();
      const payloadStr = decoder.decode(decryptedBuffer);
      const payload = JSON.parse(payloadStr);

      const { uuid, action, source, filename, expires, signature } = payload;

      if (action !== 'stream') {
        return new Response('Forbidden: Invalid Action', { status: 403 });
      }

      if (Math.floor(Date.now() / 1000) > expires) {
        return new Response('Forbidden: Token Expired', { status: 403 });
      }

      // 3. True HMAC-SHA256 Signature Verification over full string
      const dataToSign = `${uuid}:${expires}:${action}:${source}:${filename}`;
      const hmacKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(SECRET_SALT),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signedBuffer = await crypto.subtle.sign(
        "HMAC",
        hmacKey,
        encoder.encode(dataToSign)
      );

      const expectedSignatureHex = Array.from(new Uint8Array(signedBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (signature !== expectedSignatureHex) {
        return new Response('Unauthorized: Invalid Signature', { status: 401 });
      }

      // 4. Zero-Copy Streaming Proxy
      const fetchHeaders = new Headers();
      const range = request.headers.get('Range');
      if (range) {
        fetchHeaders.set('Range', range);
      }

      const sourceResponse = await fetch(source, {
        headers: fetchHeaders
      });

      if (!sourceResponse.ok) {
        return new Response("Failed to fetch upstream source.", { status: sourceResponse.status });
      }

      const responseHeaders = new Headers(sourceResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Accept-Ranges', 'bytes');
      responseHeaders.set('Content-Type', sourceResponse.headers.get('Content-Type') || 'video/mp4');
      responseHeaders.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

      return new Response(sourceResponse.body, {
        status: sourceResponse.status,
        statusText: sourceResponse.statusText,
        headers: responseHeaders
      });

    } catch (e) {
      return new Response('Internal Edge Error: ' + e.message, { status: 500 });
    }
  },
};
