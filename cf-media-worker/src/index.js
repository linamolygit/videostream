export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Unauthorized stream access.", { status: 403 });
    }

    const SECRET_SALT = env.SECRET_SALT || "enterprise_super_secret_salt_123";

    try {
      // 1. Decode Base64URL & Parse IV + Ciphertext
      let combinedStr = "";
      try {
        // Support base64url format
        const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
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

      // Convert hex strings to Uint8Arrays
      const hexToBytes = (hex) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
      };

      const iv = hexToBytes(ivHex);
      const ciphertext = hexToBytes(ciphertextHex);

      // 2. AES-256-CBC Decryption via Web Crypto API
      const encoder = new TextEncoder();
      const saltBuffer = encoder.encode(SECRET_SALT);
      const keyHash = await crypto.subtle.digest("SHA-256", saltBuffer); // 32-byte AES Key

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

      // 3. Validate Action & Route
      if (url.pathname === '/fast_stream' && action !== 'stream') {
        return new Response("Forbidden. Token action mismatch.", { status: 403 });
      }
      if (url.pathname === '/download' && action !== 'download') {
        return new Response("Forbidden. Token action mismatch.", { status: 403 });
      }
      if (url.pathname !== '/fast_stream' && url.pathname !== '/download') {
        return new Response("Not found.", { status: 404 });
      }

      // 4. Expiry Validation
      const now = Math.floor(Date.now() / 1000);
      if (now > expires) {
        return new Response("Secure stream token has expired.", { status: 403 });
      }

      // 5. True HMAC-SHA256 Signature Re-verification
      // Signed string includes: uuid, expires, action, source, filename
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

      const expectedSignature = Array.from(new Uint8Array(signedBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== expectedSignature) {
        return new Response("Invalid signature payload signature mismatch.", { status: 401 });
      }

      // 6. Zero-Copy Streaming Proxy with Range Request Forwarding
      const fetchHeaders = new Headers();
      const clientRange = request.headers.get("Range");
      if (clientRange) {
        fetchHeaders.set("Range", clientRange);
      }

      // Issue fetch request to the decrypted source URL
      const sourceResponse = await fetch(source, {
        headers: fetchHeaders,
      });

      if (!sourceResponse.ok) {
        return new Response("Failed to fetch upstream source.", { status: sourceResponse.status });
      }

      const newResponse = new Response(sourceResponse.body, sourceResponse);
      const headers = new Headers(newResponse.headers);

      // Route 1: Secure Stream Engine (/fast_stream)
      if (url.pathname === '/fast_stream') {
        headers.set("Content-Type", sourceResponse.headers.get("Content-Type") || "video/mp4");
        headers.set("Accept-Ranges", "bytes");
        headers.set("Access-Control-Allow-Origin", "*");
        // Prevent Cloudflare cache key collisions across different users/tokens
        headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
      }

      // Route 2: Secure Download Engine (/download)
      if (url.pathname === '/download') {
        headers.set("Content-Type", "application/octet-stream");
        const safeFilename = (filename || 'download.mp4').replace(/[^a-zA-Z0-9.\-_]/g, '');
        headers.set("Content-Disposition", `attachment; filename="${safeFilename}"`);
        headers.set("Access-Control-Allow-Origin", "*");
      }

      return new Response(newResponse.body, {
        status: newResponse.status,
        headers: headers
      });

    } catch (e) {
      return new Response("Handshake encryption error: " + e.message, { status: 500 });
    }
  }
}
