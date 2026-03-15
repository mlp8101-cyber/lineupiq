import { list, fetch as blobFetch } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Find the roster blob
    const { blobs } = await list({ prefix: 'slammers-roster' });
    if (!blobs.length) return res.status(200).json(null);

    // Fetch the most recently uploaded one
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const response = await blobFetch(latest.url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Blob read error:', err);
    return res.status(500).json({ error: 'Failed to load roster' });
  }
}
