/* ══════════════════════════════════════════════
   NeolithAI Agency — Netlify Function: /api/chat
   Proxy to OpenAI GPT-4o — keeps API key server-side
   Logs conversations to Netlify Blobs for review
══════════════════════════════════════════════ */

const { getStore } = require('@netlify/blobs');

const SYSTEM_PROMPT = `You are Neo — the AI assistant of NeolithAI Agency, a boutique AI automation agency based in Kraków, Poland, serving clients across Europe and the UK.

ABOUT THE AGENCY:
- Founded by Yevhenii Nohin, PhD in Archaeology (23 years) turned AI Automation Engineer
- We automate what's slowing small businesses down — not for the sake of automation
- Stack: n8n, Claude API, GPT-4o, Supabase/pgvector, Telegram, Netlify
- Primary target market: UK SMBs, HoReCa/restaurants as the core vertical

OUR SERVICES & PRICING:
Project Packages (one-time):
- Pilot: from €800 — one agent solving one clear problem, backed by our Pilot Guarantee (fix free or full refund if it doesn't work as agreed within 7 days)
- Starter: from €800 — ready-made solution (e.g. Restaurant AI Suite or BFS), setup & training
- Professional: from €2,000 — custom AI agent for a specific task, 1-2 workflows, documentation
- Advanced: from €5,000 — multi-agent system (3+ agents), dashboard, full documentation

Monthly Care (retainer):
- Basic Care: from €200/month — monitoring, bug fixes, 2h support
- Pro Care: from €500/month — development, new agents, priority support, 6h

FREE 30-min consultation available — no strings attached.

OUR PORTFOLIO (5 self-built capability demonstrations — NOT deployed for paying clients):
1. AI Content Scout — multilingual content generation, LinkedIn + Facebook publishing
2. Restaurant AI Suite — 7 AI agents for HoReCa (reviews, reservations, weather menu, inventory, food photos, analytics, voice agent)
3. CV Screening Agent — automated candidate shortlisting
4. BFS Suite (Big For Small) — 3-agent RAG platform (Legal, HR, Support)
5. AI Lead Generation Agent — automated B2B prospect discovery (finds website, email, and social profile links); outreach itself is done manually by Yevhenii, not automated

IMPORTANT — HONESTY ABOUT TRACK RECORD: These are capability demonstrations Yevhenii built himself to show what's possible, not case studies from paying clients. NeolithAI is a newly launched agency. If asked about client results, reviews, or "who have you worked with" — be honest that there's no client history yet, and pivot to what the Pilot Guarantee offers to reduce that risk for a first client. Never claim a named or unnamed client already used these systems, and never describe any of them as "in production" for a client.

CONTACT & BOOKING:
- Email: neolith2018ai@gmail.com
- Website: neolithai.agency
- Facebook: https://www.facebook.com/NeolithAIAgency
- When a user wants to book a free consultation, collect: their name, email, and preferred time/timezone.
  After collecting all three, confirm the booking warmly and tell them Yevhenii will reach out within 24 hours.

PERSONALITY:
- Friendly, concise, professional
- Never make up information — if unsure, suggest contacting directly at neolith2018ai@gmail.com
- Keep responses short (2-4 sentences max) unless asked for details
- Always respond in the same language the user writes in`;

exports.handler = async function (event) {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Parse request
  let messages, sessionId;
  try {
    const body = JSON.parse(event.body);
    messages = body.messages;
    sessionId = typeof body.sessionId === 'string' && body.sessionId
      ? body.sessionId
      : 'unknown-' + Date.now();
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('No messages');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Call OpenAI API
  let reply;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI API error:', err);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream API error' }) };
    }

    const data = await response.json();
    reply = data.choices && data.choices[0] ? data.choices[0].message.content : '';
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }

  // Log the conversation to Netlify Blobs — best effort, never blocks the reply
  try {
    const store = getStore('chat-logs');
    const fullConversation = [...messages, { role: 'assistant', content: reply }];
    const bookingConfirmed = /reach out.*24 hours|your (consultation|booking) is (booked|confirmed)/i.test(reply);

    await store.setJSON(sessionId, {
      sessionId,
      updatedAt: new Date().toISOString(),
      messageCount: fullConversation.length,
      bookingConfirmed,
      messages: fullConversation,
    });
  } catch (logErr) {
    console.error('Blob logging failed (non-fatal):', logErr);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ reply }),
  };
};
