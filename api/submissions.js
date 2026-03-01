const BLOB_PATH = 'ramadan/submissions.json';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const rawSecret = process.env.DASHBOARD_SECRET;
  const secret = rawSecret ? String(rawSecret).trim() : '';

  if (!secret || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { get } = await import('@vercel/blob');

    let submissions = [];
    try {
      const result = await get(BLOB_PATH, { access: 'private' });
      if (result && result.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        const data = JSON.parse(text);
        submissions = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error('Submissions get error:', e);
    }

    res.status(200).json(submissions);
  } catch (err) {
    console.error('Submissions API error:', err);
    res.status(500).json({ error: 'Failed to load submissions' });
  }
}
