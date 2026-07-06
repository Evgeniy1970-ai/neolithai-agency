/* ══════════════════════════════════════════════
   NeolithAI Agency — Netlify Function: /api/admin-chats
   Returns logged Neo conversations from Netlify Blobs.
   Protected by a simple password header (ADMIN_PASSWORD env var).
   NOTE: This is basic protection suitable for a solo-founder review
   tool — not enterprise-grade auth. Don't share the password.
══════════════════════════════════════════════ */

const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Password check
  const providedPassword = event.headers['x-admin-password'] || event.headers['X-Admin-Password'];
  if (!process.env.ADMIN_PASSWORD || providedPassword !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store = getStore('chat-logs');
    const { blobs } = await store.list();

    const conversations = await Promise.all(
      blobs.map(async (b) => {
        try {
          return await store.get(b.key, { type: 'json' });
        } catch (e) {
          return null;
        }
      })
    );

    const valid = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return { statusCode: 200, headers, body: JSON.stringify({ conversations: valid }) };
  } catch (e) {
    console.error('admin-chats error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
