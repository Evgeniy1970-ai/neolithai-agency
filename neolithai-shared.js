/* ══════════════════════════════════════════════
   NeolithAI Agency — Shared JS v2.0
══════════════════════════════════════════════ */

/* ── LANG ── */
var NAV_LABELS = {
  en: ['Services','Cases','About','Blog','Contact','Book a Call'],
  ru: ['Услуги','Кейсы','О нас','Блог','Контакты','Записаться'],
  es: ['Servicios','Casos','Sobre nosotros','Blog','Contacto','Reservar llamada'],
  uk: ['Послуги','Кейси','Про нас','Блог','Контакти','Записатись']
};
var NAV_KEYS = ['services','cases','about','blog','contact','book'];

function setLang(l) {
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-lang-btn') === l);
  });
  document.querySelectorAll('[data-lang]').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-lang') === l);
  });
  document.querySelectorAll('[data-nav]').forEach(function(link) {
    var key = link.getAttribute('data-nav');
    var idx = NAV_KEYS.indexOf(key);
    if (idx !== -1 && NAV_LABELS[l]) link.textContent = NAV_LABELS[l][idx];
  });
  try { localStorage.setItem('lang', l); } catch(e) {}
}

/* ── NAV SCROLL ── */
function initNav() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Active link by current page
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    if (href === page || (page === 'index.html' && href === '/') || href.includes(page)) {
      a.classList.add('active');
    }
  });
}

/* ── MOBILE MENU ── */
function toggleMenu() {
  var m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}

/* ── COUNTERS ── */
function initCounters() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = 0;
      var step = Math.ceil(target / (duration / 16));
      var timer = setInterval(function() {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = start + suffix;
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function(el) { obs.observe(el); });
}

/* ── NEWSLETTER ── */
function initNewsletter() {
  var form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = form.querySelector('[name="email"]');
    if (!email || !email.value.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    fetch('/', { method: 'POST', body: new FormData(form) })
      .then(function() {
        form.style.display = 'none';
        var s = document.getElementById('newsletterSuccess');
        if (s) s.style.display = 'block';
      })
      .catch(function() { alert('Something went wrong. Please try again.'); });
  });
}

/* ── CONTACT FORM ── */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var message = form.querySelector('[name="message"]');
    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    fetch('/', { method: 'POST', body: new FormData(form) })
      .then(function() {
        form.reset();
        var s = document.getElementById('contactSuccess');
        if (s) { s.style.display = 'block'; }
      })
      .catch(function() { alert('Something went wrong. Please try again.'); });
  });
}

/* ══════════════════════════════════════════════
   AI CHAT WIDGET
══════════════════════════════════════════════ */
var chatHistory = [];
var chatState = 'idle'; // idle | collecting_name | collecting_email | collecting_time | done

var SYSTEM_PROMPT = `You are Nео — the AI assistant of NeolithAI Agency, a boutique AI automation agency based in Kraków, Poland, serving clients across Europe and the UK.

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

BOOKING CONSULTATIONS:
When a user wants to book a free consultation, collect: their name, email, and preferred time/timezone.
After collecting all three, confirm the booking warmly and tell them Yevhenii will reach out within 24 hours.

PERSONALITY:
- Friendly, concise, professional
- Never make up information — if unsure, suggest contacting directly at neolith2018ai@gmail.com
- Keep responses short (2-4 sentences max) unless asked for details
- Always respond in the same language the user writes in`;

function toggleChat() {
  var panel = document.getElementById('aiChatPanel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    var input = document.getElementById('aiChatInput');
    if (input) input.focus();
  }
}

function closeChat() {
  var panel = document.getElementById('aiChatPanel');
  if (panel) panel.classList.remove('open');
}

function addMessage(text, role) {
  var messages = document.getElementById('aiChatMessages');
  if (!messages) return;
  var div = document.createElement('div');
  div.className = 'msg msg-' + (role === 'user' ? 'user' : 'bot');
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function showTyping() {
  var messages = document.getElementById('aiChatMessages');
  if (!messages) return null;
  var div = document.createElement('div');
  div.className = 'msg msg-typing';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function removeTyping() {
  var t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function hideSuggestions() {
  var s = document.getElementById('aiSuggestions');
  if (s) s.style.display = 'none';
}

async function sendMessage(text) {
  if (!text || !text.trim()) return;
  hideSuggestions();
  addMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });

  var input = document.getElementById('aiChatInput');
  if (input) input.value = '';

  var typing = showTyping();

  try {
    var response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    });
    var data = await response.json();
    removeTyping();
    var reply = data.reply || "I'm sorry, I couldn't process that. Please try again.";
    chatHistory.push({ role: 'assistant', content: reply });
    addMessage(reply, 'bot');

    // If booking detected — save to Netlify
    if (chatState === 'done' || reply.toLowerCase().includes('reach out within 24')) {
      saveBooking();
    }
  } catch(e) {
    removeTyping();
    addMessage("Sorry, I'm having trouble connecting right now. Please email us at neolith2018ai@gmail.com", 'bot');
  }
}

function saveBooking() {
  // Extract booking info from conversation and send to Netlify
  var fullConvo = chatHistory.map(function(m) { return m.role + ': ' + m.content; }).join('\n\n');
  var form = new FormData();
  form.append('form-name', 'chat-booking');
  form.append('conversation', fullConvo);
  fetch('/', { method: 'POST', body: form }).catch(function() {});
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    var input = document.getElementById('aiChatInput');
    if (input) sendMessage(input.value.trim());
  }
}

function sendSuggestion(text) {
  sendMessage(text);
}

function initChat() {
  // Add welcome message
  setTimeout(function() {
    var messages = document.getElementById('aiChatMessages');
    if (!messages) return;
    var div = document.createElement('div');
    div.className = 'msg msg-bot';
    div.textContent = "Hi! I'm Nео, NeolithAI's assistant 👋 I can tell you about our services, pricing, or book you a free 30-min consultation. How can I help?";
    messages.appendChild(div);
  }, 300);
}

/* ── BLOG TOGGLE ── */
function toggleBlog(id, btn) {
  var body = document.getElementById(id);
  if (!body) return;
  var isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? 'Read more ↓' : 'Read less ↑';
}

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', function() {
  // Lang
  var saved;
  try { saved = localStorage.getItem('lang'); } catch(e) {}
  setLang(saved && ['en','ru','es','uk'].indexOf(saved) !== -1 ? saved : 'en');

  initNav();
  initReveal();
  initCounters();
  initNewsletter();
  initContactForm();
  initChat();
});
