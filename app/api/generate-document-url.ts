import type { NextApiRequest, NextApiResponse } from 'next';
import { generateSignedUrl } from '@/lib/cloudinary'; // Adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { publicId } = req.query;

  if (!publicId || typeof publicId !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid publicId' });
  }

  try {
    // You can add authentication/authorization here to ensure
    // only permitted users can get signed URLs for documents
    // For example, check if the document belongs to the current user's client.

    const signedUrl = generateSignedUrl(publicId); // Use your existing function
    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    res.status(500).json({ message: 'Failed to generate signed URL' });
  }
}