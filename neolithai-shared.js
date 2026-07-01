/* ══════════════════════════════════════════════
   NeolithAI Agency — Shared JS v3.0
══════════════════════════════════════════════ */

/* ── LANG ── */
var NAV_LABELS = {
  en: ['Services','Cases','About','Blog','Contact','Book a Call'],
  ru: ['Услуги','Кейсы','О нас','Блог','Контакты','Записаться'],
  es: ['Servicios','Casos','Sobre nosotros','Blog','Contacto','Reservar llamada'],
  uk: ['Послуги','Кейси','Про нас','Блог','Контакти','Записатись']
};
var NAV_KEYS = ['services','cases','about','blog','contact','book'];

var CHAT_TXT = {
  en: { welcome: "Hi! I'm Neo, NeolithAI's assistant 👋 I can tell you about our services, pricing, or book you a free 30-min consultation. How can I help?", placeholder: "Ask me anything…", error: "Sorry, I'm having trouble connecting right now. Please email us at neolith2018ai@gmail.com" },
  ru: { welcome: "Привет! Я Neo, ассистент NeolithAI 👋 Расскажу об услугах и ценах или запишу вас на бесплатную 30-минутную консультацию. Чем помочь?", placeholder: "Спросите что угодно…", error: "Извините, не получается подключиться. Напишите нам на neolith2018ai@gmail.com" },
  es: { welcome: "¡Hola! Soy Neo, el asistente de NeolithAI 👋 Puedo contarte sobre servicios, precios o reservarte una consulta gratuita de 30 min. ¿En qué ayudo?", placeholder: "Pregúntame lo que sea…", error: "Lo siento, no puedo conectar ahora. Escríbenos a neolith2018ai@gmail.com" },
  uk: { welcome: "Привіт! Я Neo, асистент NeolithAI 👋 Розкажу про послуги й ціни або запишу вас на безкоштовну 30-хвилинну консультацію. Чим допомогти?", placeholder: "Запитайте будь-що…", error: "Вибачте, не вдається підключитися. Напишіть нам на neolith2018ai@gmail.com" }
};

function currentLang() {
  try { var l = localStorage.getItem('lang'); if (l && ['en','ru','es','uk'].indexOf(l) !== -1) return l; } catch(e) {}
  return 'en';
}

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
  document.documentElement.setAttribute('lang', l);
  var input = document.getElementById('aiChatInput');
  if (input && CHAT_TXT[l]) input.setAttribute('placeholder', CHAT_TXT[l].placeholder);
  // Re-localize the welcome bubble if chat not yet engaged
  if (chatHistory.length === 0) {
    var w = document.querySelector('#aiChatMessages .msg-bot[data-welcome]');
    if (w && CHAT_TXT[l]) w.textContent = CHAT_TXT[l].welcome;
  }
  try { localStorage.setItem('lang', l); } catch(e) {}
}

/* ── THEME ── */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  try { localStorage.setItem('theme', t); } catch(e) {}
}
function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
function initTheme() {
  var saved;
  try { saved = localStorage.getItem('theme'); } catch(e) {}
  if (!saved) saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  applyTheme(saved);
}

/* Inject theme toggle + mobile language switcher into every page */
function injectChrome() {
  var navRight = document.querySelector('.nav-right');
  if (navRight && !navRight.querySelector('.theme-toggle')) {
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('onclick', 'toggleTheme()');
    btn.innerHTML = '<i data-lucide="moon" class="ic-sm ic-moon"></i><i data-lucide="sun" class="ic-sm ic-sun"></i>';
    var burger = navRight.querySelector('.burger');
    navRight.insertBefore(btn, burger || null);
  }
  var menu = document.getElementById('mobileMenu');
  if (menu && !menu.querySelector('.mobile-lang')) {
    var wrap = document.createElement('div');
    wrap.className = 'mobile-lang';
    ['en','ru','es','uk'].forEach(function(code) {
      var b = document.createElement('button');
      b.className = 'lang-btn';
      b.setAttribute('data-lang-btn', code);
      b.setAttribute('onclick', "setLang('" + code + "')");
      b.textContent = code === 'uk' ? 'UA' : code.toUpperCase();
      wrap.appendChild(b);
    });
    menu.appendChild(wrap);
  }
}

/* ── NAV ── */
function initNav() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    if (href === page || (page === 'index.html' && href === '/') || (href.split('#')[0] === page && href.split('#')[0] !== '')) {
      if (!a.classList.contains('nav-cta')) a.classList.add('active');
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
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}

/* ── COUNTERS ── */
function initCounters() {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced || isNaN(target)) { el.textContent = (isNaN(target)?'':target) + suffix; obs.unobserve(el); return; }
      var duration = 1400, start = 0;
      var step = Math.max(1, Math.ceil(target / (duration / 16)));
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      alert('Please enter a valid email address.'); return;
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
    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) { alert('Please fill in all fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { alert('Please enter a valid email address.'); return; }
    fetch('/', { method: 'POST', body: new FormData(form) })
      .then(function() {
        form.reset();
        var s = document.getElementById('contactSuccess');
        if (s) s.style.display = 'block';
      })
      .catch(function() { alert('Something went wrong. Please try again.'); });
  });
}

/* ══════════════════════════════════════════════
   AI CHAT WIDGET
══════════════════════════════════════════════ */
var chatHistory = [];
var chatState = 'idle';

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

function addMessage(text, role, isWelcome) {
  var messages = document.getElementById('aiChatMessages');
  if (!messages) return;
  var div = document.createElement('div');
  div.className = 'msg msg-' + (role === 'user' ? 'user' : 'bot');
  if (isWelcome) div.setAttribute('data-welcome', '1');
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
function removeTyping() { var t = document.getElementById('typingIndicator'); if (t) t.remove(); }
function hideSuggestions() { var s = document.getElementById('aiSuggestions'); if (s) s.style.display = 'none'; }

function persistChat() {
  try { sessionStorage.setItem('neo_chat', JSON.stringify(chatHistory)); } catch(e) {}
}

async function sendMessage(text) {
  if (!text || !text.trim()) return;
  hideSuggestions();
  addMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });
  persistChat();
  var input = document.getElementById('aiChatInput');
  if (input) input.value = '';
  showTyping();
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
    persistChat();
    addMessage(reply, 'bot');
    if (chatState === 'done' || reply.toLowerCase().indexOf('reach out within 24') !== -1) saveBooking();
  } catch(e) {
    removeTyping();
    addMessage((CHAT_TXT[currentLang()] || CHAT_TXT.en).error, 'bot');
  }
}

function saveBooking() {
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
function sendSuggestion(text) { sendMessage(text); }

function initChat() {
  var messages = document.getElementById('aiChatMessages');
  if (!messages) return;
  var lang = currentLang();
  // Restore prior conversation from this browser session
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('neo_chat') || 'null'); } catch(e) {}
  if (saved && saved.length) {
    chatHistory = saved;
    hideSuggestions();
    saved.forEach(function(m) { addMessage(m.content, m.role === 'user' ? 'user' : 'bot'); });
  } else {
    setTimeout(function() {
      addMessage((CHAT_TXT[lang] || CHAT_TXT.en).welcome, 'bot', true);
    }, 300);
  }
}

/* ── BLOG TOGGLE (legacy) ── */
function toggleBlog(id, btn) {
  var body = document.getElementById(id);
  if (!body) return;
  var isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? 'Read more ↓' : 'Read less ↑';
}

/* ── COOKIE CONSENT ── */
var COOKIE_TXT = {
  en: { text: 'We use minimal cookies to make the site work and understand traffic. By continuing you agree to our ', link: 'Privacy Policy', accept: 'Accept', decline: 'Decline' },
  ru: { text: 'Мы используем минимум cookie, чтобы сайт работал и для аналитики. Продолжая, вы соглашаетесь с ', link: 'Политикой конфиденциальности', accept: 'Принять', decline: 'Отклонить' },
  es: { text: 'Usamos cookies mínimas para que el sitio funcione y entender el tráfico. Al continuar acepta nuestra ', link: 'Política de Privacidad', accept: 'Aceptar', decline: 'Rechazar' },
  uk: { text: 'Ми використовуємо мінімум cookie, щоб сайт працював та для аналітики. Продовжуючи, ви погоджуєтесь з ', link: 'Політикою конфіденційності', accept: 'Прийняти', decline: 'Відхилити' }
};
function initCookieConsent() {
  var choice;
  try { choice = localStorage.getItem('cookie_consent'); } catch(e) {}
  if (choice) return;
  var l = currentLang();
  var t = COOKIE_TXT[l] || COOKIE_TXT.en;
  var bar = document.createElement('div');
  bar.id = 'cookieBar';
  bar.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:400;max-width:680px;margin:0 auto;background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:0 16px 44px rgba(20,28,40,0.18);padding:16px 18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-family:var(--sans);';
  bar.innerHTML = '<span style="flex:1;min-width:240px;font-size:13.5px;color:var(--text2);line-height:1.55;">' + t.text + '<a href="privacy.html" style="color:var(--accent);font-weight:600;text-decoration:none;">' + t.link + '</a>.</span>' +
    '<div style="display:flex;gap:8px;">' +
    '<button id="ckDecline" style="background:var(--bg2);color:var(--text2);border:1px solid var(--border);border-radius:9px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">' + t.decline + '</button>' +
    '<button id="ckAccept" style="background:var(--accent);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">' + t.accept + '</button>' +
    '</div>';
  document.body.appendChild(bar);
  function close(val){ try { localStorage.setItem('cookie_consent', val); } catch(e) {} bar.style.display='none'; }
  document.getElementById('ckAccept').addEventListener('click', function(){ close('accepted'); });
  document.getElementById('ckDecline').addEventListener('click', function(){ close('declined'); });
}

/* ── GUIDE / LEAD MAGNET ── */
function initGuideForm() {
  var form = document.getElementById('guideForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = form.querySelector('[name="email"]');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      alert('Please enter a valid email address.'); return;
    }
    fetch('/', { method: 'POST', body: new FormData(form) }).catch(function(){});
    form.style.display = 'none';
    var s = document.getElementById('guideSuccess');
    if (s) { s.style.display = 'block'; if (window.lucide) lucide.createIcons(); }
    // Open the guide for the user right away
    try { window.open('guide-7-processes.html', '_blank'); } catch(err) {}
  });
}

/* ── ICONS ── */
function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  injectChrome();
  setLang(currentLang());
  initNav();
  initReveal();
  initCounters();
  initNewsletter();
  initContactForm();
  initGuideForm();
  initChat();
  initCookieConsent();
  initIcons();
});
