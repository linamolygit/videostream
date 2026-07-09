import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const serializedCookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1, // Expire immediately
    path: '/'
  });

  res.setHeader('Set-Cookie', serializedCookie);
  return res.status(200).json({ message: 'Logged out successfully' });
}
