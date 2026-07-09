import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import crypto from 'crypto';

const prisma = new PrismaClient();
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const SECRET_SALT = process.env.SECRET_SALT || "enterprise_super_secret_salt_123";
const FAST_STREAM_WORKER = process.env.FAST_STREAM_WORKER_URL || "https://withered-term-6150.ledepamu.workers.dev/fast_stream";
const DOWNLOAD_WORKER = process.env.DOWNLOAD_WORKER_URL || "https://delicate-field-a4f6.fanebowa.workers.dev/download";

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    // Secure serverless route that requires a bearer API Token shared with WordPress.
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(' ')[1];
    // Very simple verification: Token must exist in the database for an active user.
    let user = null;
    if (redis) {
        const cachedUser = await redis.get(`api_token:${token}`);
        if (cachedUser) user = JSON.parse(cachedUser);
    }
    
    if (!user) {
        user = await prisma.user.findUnique({ where: { api_token: token } });
        if (!user) {
            return res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });
        }
        if (redis) {
            await redis.set(`api_token:${token}`, JSON.stringify(user), "EX", 3600);
        }
    }

    const { uuid, action } = req.body;

    if (!uuid || !action) {
        return res.status(400).json({ success: false, error: "Missing required parameters: uuid or action" });
    }

    if (action !== 'stream' && action !== 'download') {
        return res.status(400).json({ success: false, error: "Invalid action. Must be 'stream' or 'download'." });
    }

    try {
        // Fetch Video Meta from Database or cache
        let video = null;
        if (redis) {
            const cachedVideo = await redis.get(`video_meta:${uuid}`);
            if (cachedVideo) video = JSON.parse(cachedVideo);
        }
        
        if (!video) {
            video = await prisma.video.findUnique({ where: { video_uuid: uuid } });
            if (!video) return res.status(404).json({ success: false, error: "Video not found" });
            if (redis) {
                await redis.set(`video_meta:${uuid}`, JSON.stringify(video), "EX", 3600); // Cache for 1 hour
            }
        }

        // Generate Expiration Timestamp (+2 hours)
        const expires = Math.floor(Date.now() / 1000) + (2 * 3600);

        // Generate HMAC SHA-256 Signature
        const dataToSign = `${uuid}:${expires}:${action}:${SECRET_SALT}`;
        const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

        // Build JSON Payload
        const payload = {
            uuid: video.video_uuid,
            action: action,
            source: video.original_source_url,
            filename: video.file_name,
            expires: expires,
            signature: signature
        };

        // Encrypt/Base64-encode this payload to generate the ultimate edge token
        const edgeToken = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Target URLs
        const streamUrl = `${FAST_STREAM_WORKER}?token=${edgeToken}`;
        const downloadUrl = `${DOWNLOAD_WORKER}?token=${edgeToken}`;

        return res.status(200).json({
            success: true,
            urls: {
                stream: streamUrl,
                download: downloadUrl
            }
        });

    } catch (error) {
        console.error("Token Generation Error:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}
