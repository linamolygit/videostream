import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'e5ec0ac881346d2283cbac612ff95607';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const IMAGE_BUCKET = process.env.R2_IMAGE_BUCKET || 'imgstore1';
const IMAGE_PUBLIC_URL = process.env.R2_IMAGE_DEV_URL || 'https://pub-e755e9e218f740aa81c5793c4926ad2b.r2.dev';

const VIDEO_BUCKET = process.env.R2_VIDEO_BUCKET || 'videohost1';
const VIDEO_PUBLIC_URL = process.env.R2_VIDEO_DEV_URL || 'https://pub-99dc01532a4a449c98e23f488ce91305.r2.dev';

async function getAuthUser(req) {
  if (req.cookies && req.cookies.auth_token) {
    try {
      const decoded = jwt.verify(req.cookies.auth_token, process.env.JWT_SECRET || 'fallback-secret');
      return await prisma.user.findUnique({ where: { id: decoded.userId } });
    } catch (e) {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
  }

  const { fileName, fileType, mediaCategory } = req.body; // mediaCategory: 'video' | 'image' | 'thumbnail'

  if (!fileName || !fileType) {
    return res.status(400).json({ success: false, error: 'File name and file type are required.' });
  }

  // Determine target bucket and public base URL
  const isVideo = mediaCategory === 'video';
  const bucket = isVideo ? VIDEO_BUCKET : IMAGE_BUCKET;
  const publicBaseUrl = isVideo ? VIDEO_PUBLIC_URL : IMAGE_PUBLIC_URL;

  // Generate unique filename on R2
  const ext = fileName.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const uniqueKey = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const publicUrl = `${publicBaseUrl}/${uniqueKey}`;

  // If Cloudflare R2 API keys are provided in environment
  if (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
    try {
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: ENDPOINT,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: uniqueKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return res.status(200).json({
        success: true,
        presigned: true,
        uploadUrl,
        publicUrl,
        key: uniqueKey,
        bucket,
      });
    } catch (err) {
      console.error('Failed to generate R2 presigned URL:', err);
      // Fallback below
    }
  }

  // Fallback mode: Returns direct upload destination URL when R2 keys are not configured yet
  return res.status(200).json({
    success: true,
    presigned: false,
    publicUrl,
    key: uniqueKey,
    bucket,
  });
}
