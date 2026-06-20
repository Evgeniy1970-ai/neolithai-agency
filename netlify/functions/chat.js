/* ══════════════════════════════════════════════
   NeolithAI Agency — Netlify Function: /api/chat
   Proxy to OpenAI GPT-4o — keeps API key server-side
══════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are Neo — the AI assistant of NeolithAI Agency, a boutique AI automation agency based in Kraków, Poland, serving clients across Europe and the UK.

ABOUT THE AGENCY:
- Founded by Yevhenii Nohin, PhD in Archaeology turned AI Automation Engineer
- We automate what's slowing small businesses down — not for the sake of automation
- Stack: n8n, Claude API, GPT-4o, Supabase/pgvector, Telegram, Netlify

OUR SERVICES & PRICING:
Project Packages (one-time):
- Starter: from €800 — ready-made solution (e.g. Restaurant AI Suite or BFS), setup & training
- Professional: from €2,000 — custom AI agent for a specific task, 1-2 workflows, documentation
- Advanced: from €5,000 — multi-agent system (3+ agents), dashboard, full documentation

Monthly Care (retainer):
- Basic: from €200/month — monitoring, bug fixes, 2h support
- Pro: from €500/month — development, new agents, priority support, 6h

FREE 30-min consultation available — no strings attached.

OUR PORTFOLIO (5 projects):
1. AI Content Master — 9× content units per prompt, 3 languages × 3 formats + DALL-E image
2. Restaurant AI Suite — 5 AI agents for restaurants (reviews, reservations, weather menu, inventory, food photos)
3. CV Screening Agent — 10× faster candidate shortlisting, 3-workflow system
4. BFS Suite (Big For Small) — 3-agent RAG platform (Legal, HR, Support) with live demo at charming-sable-0dd4f8.netlify.app
5. AI Lead Generation Agent — fully autonomous B2B outreach pipeline

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
  let messages;
  try {
    const body = JSON.parse(event.body);
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('No messages');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Call OpenAI API
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
    const reply = data.choices && data.choices[0] ? data.choices[0].message.content : '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };
  } catch (e) {
    console.error('Function error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
