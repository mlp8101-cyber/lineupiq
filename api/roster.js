'use strict';
const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { blobs } = await list({ prefix: 'slammers-roster' });
    if (!blobs.length) return res.status(200).json(null);

    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

    // Blobs are public — fetch via URL directly
    const response = await fetch(latest.url);
    if (!response.ok) throw new Error('Blob fetch failed: ' + response.status);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error('Blob read error:', err);
    return res.status(500).json({ error: err.message });
  }
};
