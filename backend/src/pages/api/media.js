import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import crypto from 'crypto';

const prisma = new PrismaClient();
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const SECRET_SALT = process.env.SECRET_SALT || "enterprise_super_secret_salt_123";
const WORKER_URL = "https://withered-term-6150.ledepamu.workers.dev/fast_stream";

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-WP-Nonce, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, uuid } = req.query;

    if (!uuid) {
        return res.status(400).json({ success: false, error: "Missing parameter: uuid" });
    }

    try {
        // Fetch Video Meta from Database or cache
        let video = null;
        if (redis) {
            video = await redis.get(`video_meta:${uuid}`);
        }
        
        if (!video) {
            video = await prisma.video.findUnique({ where: { video_uuid: uuid } });
            if (!video) return res.status(404).json({ success: false, error: "Video not found" });
            if (redis) {
                await redis.set(`video_meta:${uuid}`, JSON.stringify(video), "EX", 3600); // Cache for 1 hour
            }
        } else {
            video = JSON.parse(video);
        }

        // Action 1: Get Secure Thumbnail
        if (action === "get_thumb") {
            return res.status(200).json({ success: true, thumbnail: video.thumbnail_path });
        }

        // Action 2: Get Secure Stream Link
        if (action === "get_stream") {
            if (video.source_type === "iframe") {
                // If using external iframe hosting like qu.ax
                const iframe_html = `
                <div style="width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    <iframe src="${video.original_source_url}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                </div>`;
                return res.status(200).json({ success: true, player_html: iframe_html });
            }

            // Generate Cryptographic Expirable Streaming Token
            const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour validity
            const actionStr = 'stream';
            const dataToSign = `${uuid}:${expires}:${actionStr}:${SECRET_SALT}`;
            const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

            // Construct secure Worker URL parameter array
            const payload = {
                uuid: video.video_uuid,
                action: actionStr,
                source: video.original_source_url,
                filename: video.file_name,
                expires: expires,
                signature: signature
            };
            const streamToken = Buffer.from(JSON.stringify(payload)).toString('base64');
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

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
