import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import crypto from 'crypto';

const prisma = new PrismaClient();
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const SECRET_SALT = process.env.SECRET_SALT || "enterprise_super_secret_salt_123";
const WORKER_URL = process.env.WORKER_URL || "https://withered-term-6150.ledepamu.workers.dev/fast_stream";

// In-memory sliding-window IP rate limiting (30 req / min)
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

// AES-256-CBC Token Encryptor
function encryptToken(payloadObj) {
    const key = crypto.createHash('sha256').update(SECRET_SALT).digest();
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

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ success: false, error: "Too many requests. Please try again later." });
    }

    const { action, uuid } = req.query;

    if (!uuid) {
        return res.status(400).json({ success: false, error: "Missing parameter: uuid" });
    }

    try {
        // Fetch Video/Media record
        let video = null;
        if (redis) {
            const cachedMeta = await redis.get(`video_meta:${uuid}`);
            if (cachedMeta) video = JSON.parse(cachedMeta);
        }

        if (!video) {
            video = await prisma.video.findUnique({ where: { video_uuid: uuid } });
            if (!video) return res.status(404).json({ success: false, error: "Media not found" });
            if (redis) {
                await redis.set(`video_meta:${uuid}`, JSON.stringify(video), "EX", 3600);
            }
        }

        const isCarousel = video.media_type === 'carousel';
        let imagesList = [];
        if (isCarousel && video.carousel_images) {
            try { imagesList = JSON.parse(video.carousel_images); } catch(e) { imagesList = []; }
        }

        // Action 1: Get Secure Thumbnail / Carousel Info
        if (action === "get_thumb") {
            return res.status(200).json({
                success: true,
                media_type: video.media_type || 'video',
                thumbnail: video.thumbnail_path || (imagesList[0] || null),
                images: imagesList
            });
        }

        // Action 2: Get Secure Stream / Player Markup
        if (action === "get_stream") {
            if (isCarousel) {
                return res.status(200).json({
                    success: true,
                    media_type: 'carousel',
                    images: imagesList
                });
            }

            // Generate Cryptographic Streaming Token (15 min validity)
            const expires = Math.floor(Date.now() / 1000) + 900;
            const actionStr = 'stream';
            
            const dataToSign = `${uuid}:${expires}:${actionStr}:${video.original_source_url}:${video.file_name}`;
            const signature = crypto.createHmac('sha256', SECRET_SALT).update(dataToSign).digest('hex');

            const payload = {
                uuid: video.video_uuid,
                action: actionStr,
                source: video.original_source_url,
                filename: video.file_name,
                expires: expires,
                signature: signature
            };

            const streamToken = encryptToken(payload);
            const streamUrl = `${WORKER_URL}?token=${streamToken}`;

            const player_html = `
            <style>
                .ems-video-wrapper { width:100%; max-width:850px; background:#000; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.3); margin:0 auto; }
                .ems-player { width:100%; aspect-ratio:16/9; display:block; }
                @media (max-width: 768px) { .ems-player { aspect-ratio: 9/16; object-fit: cover; } }
            </style>
            <div class="ems-video-wrapper">
                <video class="ems-player" controls autoplay playsinline referrerpolicy="no-referrer">
                    <source src="${streamUrl}" type="video/mp4">
                </video>
            </div>`;

            return res.status(200).json({ success: true, player_html, stream_url: streamUrl });
        }

        return res.status(400).json({ success: false, error: "Invalid action" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
