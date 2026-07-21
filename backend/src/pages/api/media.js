import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import crypto from 'crypto';

const prisma = new PrismaClient();
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const SECRET_SALT = process.env.SECRET_SALT || "enterprise_super_secret_salt_123";
const WORKER_URL = process.env.WORKER_URL || "https://withered-term-6150.ledepamu.workers.dev/fast_stream";

// In-memory rate limiting store (30 requests per minute per IP)
const rateLimitMap = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 30;

    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
    } else {
        record.count++;
    }
    rateLimitMap.set(ip, record);
    return record.count <= limit;
}

// AES-256-CBC Helper Function
function encryptToken(payloadObj) {
    const key = crypto.createHash('sha256').update(SECRET_SALT).digest(); // 32 bytes key
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(payloadObj), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const combined = iv.toString('hex') + ':' + encrypted;
    return Buffer.from(combined).toString('base64url');
}

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-WP-Nonce, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Rate limiting check
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ success: false, error: "Too many requests. Please try again later." });
    }

    const { action, uuid } = req.query;

    if (!uuid) {
        return res.status(400).json({ success: false, error: "Missing parameter: uuid" });
    }

    try {
        // Action 1: Get Secure Thumbnail
        if (action === "get_thumb") {
            let thumbPath = null;
            if (redis) {
                thumbPath = await redis.get(`video_thumb:${uuid}`);
            }

            if (!thumbPath) {
                const video = await prisma.video.findUnique({
                    where: { video_uuid: uuid },
                    select: { thumbnail_path: true }
                });
                if (!video) return res.status(404).json({ success: false, error: "Video not found" });
                thumbPath = video.thumbnail_path;
                if (redis) {
                    await redis.set(`video_thumb:${uuid}`, thumbPath, "EX", 3600); // 1 hour cache
                }
            }

            return res.status(200).json({ success: true, thumbnail: thumbPath });
        }

        // Action 2: Get Secure Stream Link
        if (action === "get_stream") {
            let video = null;
            if (redis) {
                const cachedMeta = await redis.get(`video_meta:${uuid}`);
                if (cachedMeta) video = JSON.parse(cachedMeta);
            }

            if (!video) {
                video = await prisma.video.findUnique({ where: { video_uuid: uuid } });
                if (!video) return res.status(404).json({ success: false, error: "Video not found" });
                if (redis) {
                    await redis.set(`video_meta:${uuid}`, JSON.stringify(video), "EX", 3600);
                }
            }

            if (video.source_type === "iframe") {
                const iframe_html = `
                <div style="width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    <iframe src="${video.original_source_url}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                </div>`;
                return res.status(200).json({ success: true, player_html: iframe_html });
            }

            // Expirable token valid for 15 minutes (900s)
            const expires = Math.floor(Date.now() / 1000) + 900;
            const actionStr = 'stream';
            
            // True HMAC-SHA256 signature including source and filename
            const dataToSign = `${uuid}:${expires}:${actionStr}:${video.original_source_url}:${video.file_name}`;
            const signature = crypto.createHmac('sha256', SECRET_SALT).update(dataToSign).digest('hex');

            // Construct payload
            const payload = {
                uuid: video.video_uuid,
                action: actionStr,
                source: video.original_source_url,
                filename: video.file_name,
                expires: expires,
                signature: signature
            };

            // AES-256-CBC Encrypted Token (Prevents DevTools Base64 decode URL leakage)
            const streamToken = encryptToken(payload);
            const streamUrl = `${WORKER_URL}?token=${streamToken}`;

            const player_html = `
            <style>
                .ems-video-wrapper { width:100%; max-width:800px; background:#000; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.4); margin: 0 auto; }
                .ems-player { width:100%; aspect-ratio:16/9; display:block; }
                @media (max-width: 768px) { .ems-player { aspect-ratio: 9/16; object-fit: cover; } }
            </style>
            <div class="ems-video-wrapper">
                <video class="ems-player" controls autoplay playsinline referrerpolicy="no-referrer">
                    <source src="${streamUrl}" type="video/mp4">
                </video>
            </div>`;

            return res.status(200).json({ success: true, player_html });
        }

        return res.status(400).json({ success: false, error: "Invalid action parameter" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
