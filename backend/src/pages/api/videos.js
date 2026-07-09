import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Simple Authentication: In a real app, use next-auth or JWT validation middleware here
  const { authorization } = req.headers;
  
  // For the sake of this admin interface, we'll accept a bearer token or session cookie validation
  let user = null;
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.split(' ')[1];
    user = await prisma.user.findUnique({ where: { api_token: token } });
  } else if (req.cookies && req.cookies.auth_token) {
    // Session auth via HttpOnly cookie
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(req.cookies.auth_token, process.env.JWT_SECRET || 'fallback-secret');
      user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    } catch (e) {
      console.error("JWT Verify Error in videos API:", e);
    }
  }

  // GET: Fetch all videos
  if (req.method === 'GET') {
    if (!user) return res.status(401).json({ error: 'Unauthorized Admin' });
    try {
      const videos = await prisma.video.findMany({ orderBy: { created_at: 'desc' } });
      return res.status(200).json({ success: true, videos });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch videos' });
    }
  }

  // POST: Create a new video
  if (req.method === 'POST') {
    if (!user) return res.status(401).json({ error: 'Unauthorized Admin' });
    try {
      const title = req.body.title;
      const thumbnail_path = req.body.thumbnail_path || req.body.thumbnail_url;
      const original_source_url = req.body.original_source_url || req.body.video_url;
      const file_name = req.body.file_name;

      if (!title || !thumbnail_path || !original_source_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate unique video UUID
      let video_uuid;
      let isUnique = false;
      while (!isUnique) {
        video_uuid = crypto.randomBytes(4).toString('hex'); // 8 char hex string
        const existing = await prisma.video.findUnique({ where: { video_uuid } });
        if (!existing) isUnique = true;
      }

      const generated_file_name = file_name || original_source_url.split('/').pop() || `${video_uuid}.mp4`;

      const video = await prisma.video.create({
        data: {
          video_uuid,
          title,
          thumbnail_path,
          original_source_url,
          file_name: generated_file_name,
          user_id: user.id
        }
      });

      return res.status(201).json({ success: true, video });
    } catch (error) {
      console.error('Create video error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // DELETE: Delete a video
  if (req.method === 'DELETE') {
    if (!user) return res.status(401).json({ error: 'Unauthorized Admin' });
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing video id' });

      await prisma.video.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete video' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
