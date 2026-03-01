const BLOB_PATH = 'ramadan/submissions.json';

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);

    if (!email || !phone) {
      return res.status(400).json({ duplicate: false, error: 'Email and phone required' });
    }

    const { get } = await import('@vercel/blob');
    let list = [];
    try {
      const result = await get(BLOB_PATH, { access: 'private' });
      if (result && result.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        const data = JSON.parse(text);
        list = Array.isArray(data) ? data : [];
      }
    } catch (_) {
      return res.status(200).json({ duplicate: false });
    }

    const duplicate = list.some(
      (entry) =>
        normalizeEmail(entry.email) === email && normalizePhone(entry.phone) === phone
    );

    res.status(200).json({ duplicate });
  } catch (err) {
    console.error('Check-duplicate API error:', err);
    res.status(200).json({ duplicate: false });
  }
}
