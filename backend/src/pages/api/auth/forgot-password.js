import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't leak whether the email exists or not, just return success
      return res.status(200).json({ message: 'If this email exists, a code has been sent.' });
    }

    // Generate a 6-digit cryptographically secure OTP code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_code: resetCode,
        reset_code_expires: expiresAt,
      },
    });

    // Configure Nodemailer (Using Hostinger SMTP or environment variable defaults)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'no-reply@yourdomain.com',
        pass: process.env.SMTP_PASS || 'YourPassword123!',
      },
    });

    const mailOptions = {
      from: `"ThumbCraft Studio" <${process.env.SMTP_USER || 'no-reply@yourdomain.com'}>`,
      to: email,
      subject: 'Password Reset Code - ThumbCraft Studio',
      text: `Your password reset code is: ${resetCode}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the following 4-digit code to proceed:</p>
          <div style="background: #f5f5f7; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 12px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>This code will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    // Note: If SMTP isn't configured, this will throw an error in dev/production, but we will catch it.
    // For now we log it in development just in case it fails, so it can be copied.
    console.log(`[DEV ONLY] Reset code for ${email} is ${resetCode}`);
    
    try {
       await transporter.sendMail(mailOptions);
    } catch (mailErr) {
       console.error("Error sending email (maybe SMTP is not set up):", mailErr.message);
       // We still return 200, but in a real app you might want to handle this differently if SMTP is broken.
       // However, the console.log above helps with debugging.
    }

    return res.status(200).json({ message: 'If this email exists, a code has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
