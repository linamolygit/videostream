import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getAuthUser(req) {
  const { authorization } = req.headers;
  let userId = null;

  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.split(' ')[1];
    const userByToken = await prisma.user.findUnique({ where: { api_token: token } });
    if (userByToken) return userByToken;
  }

  if (req.cookies && req.cookies.auth_token) {
    try {
      const decoded = jwt.verify(req.cookies.auth_token, process.env.JWT_SECRET || 'fallback-secret');
      userId = decoded.userId;
    } catch (e) {
      return null;
    }
  }

  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
  }

  // GET: Fetch user's own media items (Strict Multi-Tenant Scoping)
  if (req.method === 'GET') {
    try {
      const videos = await prisma.video.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      });
      return res.status(200).json({ success: true, videos });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch media library' });
    }
  }

  // POST: Create a new Video or Carousel Media Item
  if (req.method === 'POST') {
    try {
      const { title, media_type, thumbnail_path, original_source_url, carousel_images, file_name } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
      }

      const type = media_type === 'carousel' ? 'carousel' : 'video';

      let finalThumb = thumbnail_path;
      let carouselJson = null;

      if (type === 'video') {
        // Mandatory Thumbnail Validation for Videos
        if (!finalThumb) {
          return res.status(400).json({ success: false, error: 'Mandatory thumbnail image is required for video uploads.' });
        }
        if (!original_source_url) {
          return res.status(400).json({ success: false, error: 'Original video source URL is required.' });
        }
      } else if (type === 'carousel') {
        let imagesArray = [];
        if (Array.isArray(carousel_images)) {
          imagesArray = carousel_images;
        } else if (typeof carousel_images === 'string') {
          imagesArray = carousel_images.split('\n').map(u => u.trim()).filter(Boolean);
        }

        if (imagesArray.length === 0) {
          return res.status(400).json({ success: false, error: 'At least one image URL is required for carousel sets.' });
        }

        carouselJson = JSON.stringify(imagesArray);
        if (!finalThumb) {
          finalThumb = imagesArray[0]; // Use first image as thumbnail fallback
        }
      }

      // Generate 32-character hex UUID
      let video_uuid;
      let isUnique = false;
      while (!isUnique) {
        video_uuid = crypto.randomBytes(16).toString('hex');
        const existing = await prisma.video.findUnique({ where: { video_uuid } });
        if (!existing) isUnique = true;
      }

      const generatedFileName = file_name || (original_source_url ? original_source_url.split('/').pop() : `${video_uuid}.mp4`);

      const video = await prisma.video.create({
        data: {
          video_uuid,
          title,
          media_type: type,
          thumbnail_path: finalThumb,
          original_source_url: original_source_url || null,
          carousel_images: carouselJson,
          file_name: generatedFileName,
          user_id: user.id
        }
      });

      return res.status(201).json({ success: true, video });
    } catch (error) {
      console.error('Create media error:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  // DELETE: Delete a media item (Strict Multi-Tenant Check)
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Missing media id' });

      // Verify item belongs to logged-in user
      const existing = await prisma.video.findFirst({
        where: { id: parseInt(id), user_id: user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Media item not found or unauthorized' });
      }

      await prisma.video.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete media item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
