export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Unauthorized stream access.", { status: 403 });
    }

    try {
      // 1. Decode Token Payload
      const jsonStr = atob(token);
      const payload = JSON.parse(jsonStr);
      const { uuid, action, source, filename, expires, signature } = payload;

      // Validate Action Matches Route
      if (url.pathname === '/fast_stream' && action !== 'stream') {
        return new Response("Forbidden. Token action mismatch.", { status: 403 });
      }
      if (url.pathname === '/download' && action !== 'download') {
        return new Response("Forbidden. Token action mismatch.", { status: 403 });
      }
      if (url.pathname !== '/fast_stream' && url.pathname !== '/download') {
        return new Response("Not found.", { status: 404 });
      }

      // 2. Check Expiration
      const now = Math.floor(Date.now() / 1000);
      if (now > expires) {
        return new Response("Secure stream token has expired.", { status: 403 });
      }

      // 3. Reverify Signature
      const SECRET_SALT = env.SECRET_SALT || "enterprise_super_secret_salt_123";
      // Signature was built with: `${uuid}:${expires}:${action}:${SECRET_SALT}`
      const dataToSign = `${uuid}:${expires}:${action}:${SECRET_SALT}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(dataToSign);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      if (signature !== expectedSignature) {
        return new Response("Invalid signature payload signature mismatch.", { status: 401 });
      }

      // 4. Edge-Piping Engine (Zero-Copy Transfer)
      
      // Pass incoming Range headers for seeking/scrubbing
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

      // Create new response piped directly from the source body
      const newResponse = new Response(sourceResponse.body, sourceResponse);
      const headers = new Headers(newResponse.headers);

      // Route 1: Secure Stream Engine (/fast_stream)
      if (url.pathname === '/fast_stream') {
        headers.set("Content-Type", sourceResponse.headers.get("Content-Type") || "video/mp4");
        headers.set("Accept-Ranges", "bytes");
        headers.set("Access-Control-Allow-Origin", "https://example.com"); // Replace with actual verified subdomains
        headers.set("Cache-Control", "public, max-age=86400");
      }

      // Route 2: Secure Download Engine (/download)
      if (url.pathname === '/download') {
        headers.set("Content-Type", "application/octet-stream");
        // Sanitize the filename to prevent header injection vulnerabilities
        const safeFilename = (filename || 'download.mp4').replace(/[^a-zA-Z0-9.\-_]/g, '');
        headers.set("Content-Disposition", `attachment; filename="${safeFilename}"`);
        headers.set("Access-Control-Allow-Origin", "https://example.com");
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
