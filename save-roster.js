import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { players, lineupOrder } = req.body;

    if (!Array.isArray(players) || !Array.isArray(lineupOrder)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const payload = JSON.stringify({
      players,
      lineupOrder,
      savedAt: new Date().toISOString(),
    });

    // Delete old roster blobs first to avoid accumulation
    const { blobs } = await list({ prefix: 'slammers-roster' });
    await Promise.all(blobs.map(b => del(b.url)));

    // Write new roster blob (access: public so the GET endpoint can fetch it)
    await put('slammers-roster.json', payload, {
      access: 'public',
      contentType: 'application/json',
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Blob write error:', err);
    return res.status(500).json({ error: 'Failed to save roster' });
  }
}
