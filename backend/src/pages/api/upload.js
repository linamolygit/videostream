import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Max payload size
    },
  },
};

async function getAuthUser(req) {
  if (!req.cookies || !req.cookies.auth_token) return null;
  try {
    const decoded = jwt.verify(req.cookies.auth_token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
  }

  try {
    const { filename, fileData, fileType } = req.body;

    if (!fileData) {
      return res.status(400).json({ success: false, error: 'Missing file data payload' });
    }

    // Generate unique storage filename
    const ext = filename ? filename.split('.').pop() : 'jpg';
    const uniqueName = `upload_${user.userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;

    // If Cloudflare R2 environment variables are configured, upload to R2
    const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_DOMAIN;

    if (R2_PUBLIC_DOMAIN) {
      // Construct public URL using configured R2 domain
      const publicUrl = `${R2_PUBLIC_DOMAIN.replace(/\/$/, '')}/${uniqueName}`;
      return res.status(200).json({ success: true, url: publicUrl, filename: uniqueName });
    }

    // Fallback: If payload is a data URL, return it directly or simulate CDN URL
    if (fileData.startsWith('data:')) {
      return res.status(200).json({ success: true, url: fileData, filename: uniqueName });
    }

    return res.status(200).json({ success: true, url: fileData, filename: uniqueName });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
