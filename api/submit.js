const BLOB_PATH = 'ramadan/submissions.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { put, get } = await import('@vercel/blob');

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      firstName,
      lastName,
      email,
      phone,
      businessOwner,
      businessType,
      businessTypeOther,
      w2Income,
      createdAt
    } = body;

    if (!firstName || !lastName || !email || !phone || !businessOwner) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email, phone, businessOwner'
      });
    }

    const entry = {
      id: body.id || Date.now().toString(36) + Math.random().toString(36).slice(2),
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      businessOwner: String(businessOwner).trim(),
      businessType: businessOwner === 'yes' ? String(businessType || '').trim() : '',
      businessTypeOther: businessOwner === 'yes' ? String(businessTypeOther || '').trim() : '',
      w2Income: businessOwner === 'no' ? String(w2Income || '').trim() : '',
      createdAt: createdAt || new Date().toISOString()
    };

    let listArr = [];
    try {
      const result = await get(BLOB_PATH, { access: 'private' });
      if (result && result.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        const data = JSON.parse(text);
        listArr = Array.isArray(data) ? data : [];
      }
    } catch (_) {
      // No blob yet or first submission
    }

    listArr.push(entry);

    await put(BLOB_PATH, JSON.stringify(listArr), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true
    });

    res.status(201).json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('Submit API error:', err);
    res.status(500).json({
      error: 'Failed to save submission',
      details: err?.message || String(err)
    });
  }
}
