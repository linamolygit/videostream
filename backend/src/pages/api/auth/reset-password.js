import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.reset_code !== code) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // Check if expired
    if (!user.reset_code_expires || new Date() > user.reset_code_expires) {
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }

    // Hash new password (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        reset_code: null,
        reset_code_expires: null,
      },
    });

    return res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
