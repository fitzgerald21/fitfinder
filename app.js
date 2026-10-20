import { findStore, storeLink, googleShoppingLink, storeListForPrompt } from './stores.js';
import { DEFAULT_IMAGE_MODEL, cachedImage, cachedProducts, imageFailed, productsFailed, generateImage, searchProducts } from './photos.js';

const DEFAULT_MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash-1017';
const API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
const KEYS = { settings: 'fitfinder.settings', session: 'fitfinder.session', saved: 'fitfinder.saved' };

// ---------- Questionnaire ----------

const QUESTIONS = [
  {
    id: 'gender', label: 'Shopping for', title: 'Who are you shopping for?', type: 'single',
    options: [
      { v: "Women's", h: 'Womenswear' },
      { v: "Men's", h: 'Menswear' },
      { v: 'Gender-neutral', h: 'Unisex & androgynous cuts' },
      { v: 'Open to anything', l: 'Everything', h: 'Show me all of it' },
    ],
  },
  {
    id: 'age', label: 'Age', title: 'How old are you?', sub: 'Helps pitch the brands and styles right.', type: 'single',
    options: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
  },
  {
    id: 'occasion', label: 'Occasion', title: "What's it for?", type: 'single',
    options: [
      { v: 'Casual / everyday', l: 'Casual', h: 'Everyday, weekends' },
      { v: 'Smart casual', l: 'Smart casual', h: 'Dinners, dates' },
      { v: 'Business casual', h: 'Most offices' },
      { v: 'Business professional', l: 'Business formal', h: 'Suits, interviews' },
      { v: 'Formal / black tie', l: 'Formal', h: 'Galas, cocktail' },
      { v: 'Wedding guest', h: 'Ceremony & reception' },
      { v: 'Night out / party', l: 'Night out', h: 'Bars, parties, concerts' },
      { v: 'Vacation / travel', l: 'Vacation', h: 'Trips, beach, city breaks' },
      { v: 'Athletic / activewear', l: 'Active', h: 'Gym, running, athleisure' },
      { v: 'Outdoor / hiking', l: 'Outdoors', h: 'Hiking, camping' },
      { v: 'Loungewear', l: 'Lounge', h: 'Comfy at home' },
    ],
  },
  {
    id: 'items', label: 'Looking for', title: 'What are you looking for?', sub: 'Pick as many as you like, or go for a whole outfit.', type: 'multi', exclusive: 'Whole outfit',
    options: [
      { v: 'Whole outfit', l: 'A whole outfit', h: 'Head to toe, put together for you', wide: true },
      'Tops', 'Shirts & blouses', 'T-shirts', 'Sweaters & knits', 'Pants', 'Jeans', 'Shorts', 'Skirts', 'Dresses',
      'Suits & blazers', 'Jackets & coats', 'Shoes', 'Belts', 'Bags', 'Accessories', 'Activewear',
    ],
  },
  {
    id: 'trend', label: 'Trendiness', title: 'How trendy do you want to go?', type: 'single',
    options: [
      { v: 'Timeless classics', l: 'Timeless', h: 'Pieces that never date' },
      { v: 'Classic with a modern touch', l: 'Modern classic', h: 'Mostly classic, a little current' },
      { v: 'On-trend', h: "What's popular right now" },
      { v: 'Very trendy / fashion-forward', l: 'Fashion-forward', h: 'Newest trends, statement pieces' },
    ],
  },
  {
    id: 'vibe', label: 'Style vibes', title: 'Which vibes feel like you?', sub: 'Pick up to 3.', type: 'multi', max: 3,
    options: [
      'Minimal', 'Classic / preppy', 'Quiet luxury', 'Streetwear', 'Athleisure', 'Boho', 'Edgy / grunge', 'Romantic / feminine',
      'Rugged / workwear', 'Vintage / retro', 'Y2K', 'Coastal / relaxed', 'Scandi', 'Gorpcore / techwear', 'Artsy / eclectic',
    ],
  },
  {
    id: 'fit', label: 'Fit', title: 'How do you like things to fit?', type: 'single',
    options: [
      { v: 'Slim / fitted', l: 'Fitted', h: 'Close to the body' },
      { v: 'Regular / straight', l: 'Regular', h: 'Classic, true to size' },
      { v: 'Relaxed', h: 'A bit of room' },
      { v: 'Oversized', h: 'Roomy, slouchy' },
      { v: 'Depends on the piece', l: 'Mix it up', h: 'Balance loose and fitted' },
    ],
  },
  {
    id: 'colors', label: 'Colors', title: 'Colors you gravitate toward?', sub: 'Optional. Pick any.', type: 'multi', optional: true,
    options: [
      { v: 'Neutrals', sw: ['#ece4d8', '#c9b9a3', '#8d7c69'] },
      { v: 'Black & monochrome', l: 'Black & mono', sw: ['#111', '#777', '#eee'] },
      { v: 'Earth tones', sw: ['#7a4a2a', '#9a8a4a', '#5b6b3f'] },
      { v: 'Navy & blues', sw: ['#1f2f55', '#4a6fa5', '#a9c1e0'] },
      { v: 'Pastels', sw: ['#f5c6d0', '#cfe3c8', '#cdd7f3'] },
      { v: 'Bold brights', sw: ['#e63946', '#ffb703', '#2a9df4'] },
      { v: 'Jewel tones', sw: ['#0b6e4f', '#6a1b4d', '#1d3a8a'] },
      { v: 'Prints & patterns', sw: ['#d9a441', '#3c6e71', '#c45b3c'] },
    ],
  },
  {
    id: 'budget', label: 'Budget per piece', title: "What's your budget per piece?", type: 'single',
    options: [
      { v: 'Under $50', l: '$', h: 'Under $50' },
      { v: '$50–150', l: '$$', h: '$50–150' },
      { v: '$150–400', l: '$$$', h: '$150–400' },
      { v: '$400+', l: '$$$$', h: '$400 and up' },
      { v: 'Mix of high and low', l: 'Mix', h: 'Splurge on some, save on others', wide: true },
    ],
  },
  {
    id: 'prefs', label: 'Also matters', title: 'Anything else that matters?', sub: 'Optional. Pick any.', type: 'multi', optional: true,
    options: [
      'Sustainable / ethical', 'Secondhand & resale', 'Petite sizes', 'Tall sizes', 'Plus / extended sizes', 'Big & tall',
      'Well-known brands', 'Discover smaller brands', 'Easy returns',
    ],
  },
  {
    id: 'details', title: 'A few last details', sub: 'All optional, but they sharpen the picks.', type: 'form', optional: true,
    fields: [
      { k: 'size', label: 'Sizes', l: 'Your sizes', ph: 'e.g. M top, 32x30 pants, size 10 shoe' },
      { k: 'love', label: 'Loves', l: 'Brands or looks you love', ph: 'e.g. Aritzia, Carhartt, 90s minimalism' },
      { k: 'avoid', label: 'Avoid', l: 'Anything to avoid', ph: 'e.g. no wool, nothing cropped, no logos' },
      { k: 'notes', label: 'Notes', l: 'Anything else?', ph: 'e.g. outdoor wedding in late fall, need it by Friday', area: true },
    ],
  },
].map(q => ({ ...q, options: q.options?.map(o => (typeof o === 'string' ? { v: o } : o)) }));

// ---------- State ----------

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

const newSession = () => ({ view: 'welcome', step: 0, answers: {}, followups: null, followupsFor: null, followupAnswers: {}, results: null, resultsFor: null, messages: null });

let settings = { apiKey: '', model: DEFAULT_MODEL, serperKey: '', aiImages: true, imageModel: DEFAULT_IMAGE_MODEL, ...load(KEYS.settings, {}) };
let session = { ...newSession(), ...load(KEYS.session, {}) };
let saved = load(KEYS.saved, []);
const ui = { loading: null, error: null, controller: null };

const $ = sel => document.querySelector(sel);
const $view = $('#view');
const $actions = $('#actions');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- LLM ----------

async function chat(messages, { maxTokens = 6000, json = true } = {}) {
  ui.controller?.abort();
  const controller = (ui.controller = new AbortController());
  const send = async useJsonMode => {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey.trim()}` },
      body: JSON.stringify({
        model: settings.model.trim() || DEFAULT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) {
      let detail = '';
      try {
        const e = await res.json();
        detail = e.error?.message || e.detail?.error || (typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail || e));
      } catch {}
      const err = new Error(friendlyError(res.status, detail));
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  };
  try {
    return await send(json);
  } catch (e) {
    // Some models reject response_format; retry once without it.
    if (json && (e.status === 400 || e.status === 422)) return await send(false);
    throw e;
  } finally {
    if (ui.controller === controller) ui.controller = null;
  }
}

function friendlyError(status, detail) {
  if (status === 401 || status === 403) return 'DeepInfra rejected the API key. Check it in Settings.';
  if (status === 402) return 'Your DeepInfra account is out of credit.';
  if (status === 404) return `Model not found. Check the model name in Settings.${detail ? ` (${detail})` : ''}`;
  if (status === 429) return 'Rate limited by DeepInfra. Wait a moment and try again.';
  return `DeepInfra error ${status}${detail ? `: ${detail}` : ''}`;
}

function parseJSON(text) {
  let t = String(text).replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```(?:json)?/g, '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error("Couldn't read the AI's response. Try again.");
  return JSON.parse(t.slice(start, end + 1));
}

function profileText() {
  const a = session.answers;
  const lines = [];
  for (const q of QUESTIONS) {
    if (q.type === 'form') {
      for (const f of q.fields) if (a.details?.[f.k]?.trim()) lines.push(`- ${f.label}: ${a.details[f.k].trim()}`);
    } else {
      const v = a[q.id];
      if (v && (!Array.isArray(v) || v.length)) lines.push(`- ${q.label}: ${[].concat(v).join(', ')}`);
    }
  }
  let text = `Shopper profile:\n${lines.join('\n') || '- (skipped every question)'}`;
  const fa = session.followupAnswers;
  const followupLines = (session.followups || [])
    .filter(f => fa[f.id]?.length)
    .map(f => `- ${f.question} ${[].concat(fa[f.id]).join(', ')}`);
  if (fa.extra?.trim()) followupLines.push(`- Extra notes: ${fa.extra.trim()}`);
  if (followupLines.length) text += `\n\nFollow-up answers:\n${followupLines.join('\n')}`;
  return text;
}

const FOLLOWUP_PROMPT = `You are a sharp, friendly personal stylist. A shopper has answered a short questionnaire.
Ask exactly 3 short follow-up multiple-choice questions that would most improve your clothing recommendations for THIS shopper. Cover things the questionnaire didn't: specific silhouettes or details for the items they want, fabrics, season/climate, how dressy the event really is, what they want to feel like, problem areas they want to work around, etc. Never repeat something already answered. The shopper may have skipped questions; if basics are missing (who it's for, what they want, the occasion), ask about the most important of those first.
Each question: under 12 words, 3–5 concise options (1–5 words each). Set "multi" true if picking several makes sense.
Return only JSON: {"questions":[{"question":"...","multi":false,"options":["...","..."]}]}`;

function recsPrompt() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `You are an expert personal stylist and shopping assistant. Today is ${today}; factor in the current season and what is in stores and on trend right now.
Recommend specific, shoppable clothing pieces for the shopper below.

Rules:
- Whole outfit: 5–7 pieces that work together head to toe (include shoes; add a layer, bag or accessory if it suits the occasion).
- Specific categories: 2–3 distinct options per category (e.g. a safe pick and a more interesting one). Max 10 items total.
- Respect gender, age, occasion, budget, fit, colors, style vibes, sizes, and anything to avoid.
- The shopper may have skipped questions. Fill gaps with sensible defaults: gender-neutral or clearly labeled options if gender is missing, everyday wear if the occasion is missing, mid-range prices if the budget is missing, and a versatile 5–7 piece mix if they didn't say what they want.
- Match their trend appetite: "timeless" means enduring staples; "fashion-forward" means current-season trends and statement pieces (name the trend).
- "name": a specific, descriptive product type someone would search for (e.g. "Wide-leg pleated wool trousers"), not an exact branded product name. You may mention a brand known for the piece in "description".
- "search_query": 3–7 words as typed into a store search box. Include "women's"/"men's" when relevant plus key color and style words. No brand names unless the store sells that brand.
- "stores": 3–4 stores from the STORE LIST that realistically carry this kind of item at the shopper's budget and suit their style. Use the ids exactly. Vary stores across items. Include resale stores if they want secondhand, and extended-size stores if they need them. Add "query" only to tweak the search for that store.
- Never output URLs.

STORE LIST (id — name — price tier — w/m/u — focus):
${storeListForPrompt()}

Return only JSON in this shape:
{"headline":"catchy title for the edit, max 6 words","summary":"2–3 sentences on the style direction","items":[{"category":"Tops","name":"...","description":"1–2 sentences: fabric, cut, color, details","why":"1 sentence on why it suits them","colors":["..."],"price_range":"$40–80","search_query":"...","stores":[{"id":"jcrew"},{"id":"uniqlo","query":"optional tweak"}]}],"tips":["2–4 short styling tips"]}`;
}

function normalizeResults(d) {
  const str = v => (v == null ? '' : String(v).trim());
  const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
  const items = arr(d.items)
    .filter(i => i && i.name)
    .map(i => {
      const query = str(i.search_query) || str(i.name);
      const stores = [];
      for (const s of arr(i.stores)) {
        const store = findStore(typeof s === 'string' ? s : s?.id || s?.name);
        if (store && !stores.some(x => x.id === store.id)) stores.push({ id: store.id, query: str(s?.query) || query });
      }
      return {
        category: str(i.category), name: str(i.name), description: str(i.description), why: str(i.why),
        price: str(i.price_range || i.price), colors: arr(i.colors).map(str).filter(Boolean).slice(0, 4),
        query, stores: stores.slice(0, 4),
      };
    });
  if (!items.length) throw new Error("The AI didn't return any items. Try again.");
  return {
    headline: str(d.headline) || 'Your picks',
    summary: str(d.summary),
    tips: arr(d.tips).map(str).filter(Boolean).slice(0, 5),
    items,
  };
}

function itemLinks(item) {
  const links = item.stores.map(s => {
    const store = findStore(s.id);
    return { name: store.name, href: storeLink(store, s.query) };
  });
  links.push({ name: 'Google Shopping', href: googleShoppingLink(item.query), google: true });
  return links;
}

// ---------- Flow ----------

const answersKey = () => JSON.stringify(session.answers);
const resultsKey = () => JSON.stringify([session.answers, session.followupAnswers]);

function go(view, step) {
  if (ui.loading) cancelLoading();
  session.view = view;
  if (step != null) session.step = step;
  ui.error = null;
  render();
  window.scrollTo(0, 0);
}

function cancelLoading() {
  ui.controller?.abort();
  ui.loading = null;
}

function back() {
  const v = session.view;
  if (v === 'q') session.step > 0 ? go('q', session.step - 1) : go('welcome');
  else if (v === 'followup') go('q', QUESTIONS.length - 1);
  else if (v === 'results') session.followups?.length ? go('followup') : go('q', QUESTIONS.length - 1);
}

function finishQuestions() {
  if (!settings.apiKey.trim()) {
    ui.resumeAfterKey = true;
    openSettings('Add your DeepInfra API key to get your recommendations.');
    return;
  }
  go('followup');
}

async function runLLM(kind, fn) {
  if (ui.loading) return;
  ui.loading = kind;
  ui.error = null;
  render();
  try {
    await fn();
  } catch (e) {
    if (e.name === 'AbortError') return;
    ui.error = e.message || String(e);
  } finally {
    if (ui.loading === kind) ui.loading = null;
    render();
  }
}

function loadFollowups() {
  return runLLM('followup', async () => {
    const key = answersKey();
    const text = await chat([{ role: 'system', content: FOLLOWUP_PROMPT }, { role: 'user', content: profileText() }], { maxTokens: 3000 });
    const data = parseJSON(text);
    session.followups = (Array.isArray(data.questions) ? data.questions : [])
      .filter(q => q?.question && Array.isArray(q.options) && q.options.length)
      .slice(0, 4)
      .map((q, i) => ({ id: `f${i}`, question: String(q.question), multi: !!q.multi, options: q.options.map(String).slice(0, 6) }));
    session.followupsFor = key;
    session.followupAnswers = {};
  });
}

function loadResults() {
  return runLLM('results', async () => {
    const key = resultsKey();
    const messages = [{ role: 'system', content: recsPrompt() }, { role: 'user', content: profileText() }];
    const text = await chat(messages);
    const results = normalizeResults(parseJSON(text));
    session.results = results;
    session.resultsFor = key;
    session.messages = [...messages, { role: 'assistant', content: JSON.stringify(results) }];
  });
}

function refine(request) {
  if (!request.trim() || !session.messages) return;
  return runLLM('refine', async () => {
    const messages = [
      ...session.messages,
      { role: 'user', content: `Update the recommendations: ${request.trim()}\nReturn the complete updated JSON in the same shape.` },
    ];
    const text = await chat(messages);
    const results = normalizeResults(parseJSON(text));
    session.results = results;
    // Keep the original brief plus the latest exchange so the history stays small.
    session.messages = [messages[0], messages[1], messages.at(-1), { role: 'assistant', content: JSON.stringify(results) }];
  });
}

// ---------- Rendering ----------

function render() {
  save(KEYS.session, session);
  renderHeader();
  const views = { welcome: renderWelcome, q: renderQuestion, followup: renderFollowup, results: renderResults };
  (views[session.view] || renderWelcome)();
}

function renderHeader() {
  const v = session.view;
  $('#back').hidden = v === 'welcome';
  const total = QUESTIONS.length + 2;
  const done = v === 'q' ? session.step : v === 'followup' ? QUESTIONS.length : v === 'results' ? total : 0;
  $('#progress').hidden = v === 'welcome';
  $('#progress-bar').style.width = `${(done / total) * 100}%`;
  const count = saved.length;
  $('#saved-count').textContent = count;
  $('#saved-count').hidden = !count;
}

function setActions(html) {
  $actions.innerHTML = html;
  $actions.hidden = !html;
  document.body.classList.toggle('has-actions', !!html);
}

function renderWelcome() {
  const inProgress = Object.keys(session.answers).length > 0;
  const needsKey = !settings.apiKey.trim();
  $view.innerHTML = `
    <section class="screen welcome">
      <div class="hero-art" aria-hidden="true">${HANGER_SVG}</div>
      <p class="eyebrow">Your pocket stylist</p>
      <h1 class="display">Find clothes you'll actually love.</h1>
      <p class="lede">Answer a few quick questions about you and your style. You'll get specific pieces to look for, with links straight to shops that carry them.</p>
      <ul class="steps">
        <li><span>1</span>Tell us who you are and what it's for</li>
        <li><span>2</span>Pick your style, fit, colors and budget</li>
        <li><span>3</span>Get a shoppable list across stores</li>
      </ul>
      ${needsKey ? `<div class="note"><strong>One-time setup:</strong> add your DeepInfra API key so the stylist can work. <button class="link" data-act="settings">Open settings</button></div>` : ''}
    </section>`;
  setActions(
    inProgress
      ? `<button class="btn ghost" data-act="fresh">Start fresh</button><button class="btn primary" data-act="resume">Continue</button>`
      : `<button class="btn primary block" data-act="start">Get started</button>`
  );
}

function selectedValues(q) {
  return [].concat(session.answers[q.id] ?? []);
}

function isAnswered(q) {
  return q.type === 'form' || selectedValues(q).length > 0;
}

function renderQuestion() {
  const q = QUESTIONS[session.step];
  const sel = selectedValues(q);
  let body;
  if (q.type === 'form') {
    const vals = session.answers.details || {};
    body = `<div class="form">${q.fields
      .map(
        f => `<label class="field"><span>${esc(f.l)}</span>${
          f.area
            ? `<textarea data-k="${f.k}" rows="3" placeholder="${esc(f.ph)}">${esc(vals[f.k] || '')}</textarea>`
            : `<input data-k="${f.k}" type="text" placeholder="${esc(f.ph)}" value="${esc(vals[f.k] || '')}" autocomplete="off">`
        }</label>`
      )
      .join('')}</div>`;
  } else {
    const cards = q.options.some(o => o.h || o.sw);
    body = `<div class="${cards ? 'cards' : 'chips'}" role="group" aria-label="${esc(q.title)}">${q.options
      .map(
        o => `<button class="opt ${o.wide ? 'wide' : ''}" data-v="${esc(o.v)}" aria-pressed="${sel.includes(o.v)}">
          ${o.sw ? `<span class="sw">${o.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>` : ''}
          <span class="opt-l">${esc(o.l || o.v)}</span>${o.h ? `<span class="opt-h">${esc(o.h)}</span>` : ''}
        </button>`
      )
      .join('')}</div>`;
  }
  $view.innerHTML = `
    <section class="screen question">
      <p class="eyebrow">Question ${session.step + 1} of ${QUESTIONS.length}</p>
      <h1>${esc(q.title)}</h1>
      ${q.sub ? `<p class="sub">${esc(q.sub)}</p>` : ''}
      ${body}
    </section>`;

  const last = session.step === QUESTIONS.length - 1;
  const nextLabel = last ? 'Find my clothes' : 'Continue';
  setActions(`<button class="btn ghost" data-act="skip">Skip</button><button class="btn primary" data-act="next" ${isAnswered(q) ? '' : 'disabled'}>${nextLabel}</button>`);

  if (q.type === 'form') {
    $view.querySelectorAll('[data-k]').forEach(el =>
      el.addEventListener('input', () => {
        session.answers.details = { ...session.answers.details, [el.dataset.k]: el.value };
        save(KEYS.session, session);
      })
    );
  }
}

function toggleOption(q, v) {
  let sel = selectedValues(q);
  if (q.type === 'single') {
    session.answers[q.id] = v;
    render();
    setTimeout(() => {
      if (session.view === 'q' && QUESTIONS[session.step] === q) advance();
    }, 220);
    return;
  }
  if (sel.includes(v)) sel = sel.filter(x => x !== v);
  else if (q.exclusive && v === q.exclusive) sel = [v];
  else {
    sel = sel.filter(x => x !== q.exclusive);
    if (q.max && sel.length >= q.max) {
      toast(`Pick up to ${q.max}`);
      return;
    }
    sel.push(v);
  }
  session.answers[q.id] = sel;
  render();
}

function advance() {
  if (session.step < QUESTIONS.length - 1) go('q', session.step + 1);
  else finishQuestions();
}

function renderLoading(title, lines) {
  $view.innerHTML = `
    <section class="screen loading" aria-live="polite">
      <div class="loader" aria-hidden="true"><span></span><span></span><span></span></div>
      <h1>${esc(title)}</h1>
      <p class="sub rotating">${esc(lines[0])}</p>
      <div class="skeletons" aria-hidden="true"><div></div><div></div><div></div></div>
    </section>`;
  setActions(`<button class="btn ghost block" data-act="cancel">Cancel</button>`);
  let i = 0;
  const el = $view.querySelector('.rotating');
  const timer = setInterval(() => {
    if (!el.isConnected) return clearInterval(timer);
    i = (i + 1) % lines.length;
    el.textContent = lines[i];
  }, 2600);
}

function renderError(retryAct, extra = '') {
  $view.innerHTML = `
    <section class="screen error">
      <h1>Something went wrong</h1>
      <p class="sub">${esc(ui.error)}</p>
      <div class="error-actions">
        <button class="btn primary" data-act="${retryAct}">Try again</button>
        <button class="btn ghost" data-act="settings">Settings</button>
        ${extra}
      </div>
    </section>`;
  setActions('');
}

function renderFollowup() {
  if (ui.loading === 'followup') return renderLoading('Tailoring a few more questions', ['Reading your answers…', 'Thinking like a stylist…', 'Almost there…']);
  if (ui.error) return renderError('retry-followup', `<button class="btn ghost" data-act="skip-followup">Skip to results</button>`);
  if (!session.followups || session.followupsFor !== answersKey()) return void loadFollowups();
  if (!session.followups.length) return go('results');

  const fa = session.followupAnswers;
  $view.innerHTML = `
    <section class="screen question">
      <p class="eyebrow">Just for you</p>
      <h1>A few quick follow-ups</h1>
      <p class="sub">Your stylist wants to know a bit more. Answer any, or skip.</p>
      ${session.followups
        .map(
          f => `<div class="fq">
            <h2>${esc(f.question)}${f.multi ? ' <small>pick any</small>' : ''}</h2>
            <div class="chips">${f.options
              .map(o => `<button class="opt" data-f="${f.id}" data-v="${esc(o)}" aria-pressed="${[].concat(fa[f.id] || []).includes(o)}">${esc(o)}</button>`)
              .join('')}</div>
          </div>`
        )
        .join('')}
      <label class="field"><span>Anything else to add?</span><textarea id="extra" rows="2" placeholder="Optional">${esc(fa.extra || '')}</textarea></label>
    </section>`;
  setActions(`<button class="btn ghost" data-act="skip-followup">Skip</button><button class="btn primary" data-act="to-results">Show my picks</button>`);
  $('#extra').addEventListener('input', e => {
    session.followupAnswers.extra = e.target.value;
    save(KEYS.session, session);
  });
}

function toggleFollowup(fid, v) {
  const f = session.followups.find(x => x.id === fid);
  const fa = session.followupAnswers;
  if (f.multi) {
    const sel = [].concat(fa[fid] || []);
    fa[fid] = sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v];
  } else {
    fa[fid] = fa[fid] === v ? undefined : v;
  }
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

const savedKey = item => `${item.name}|${item.query}`.toLowerCase();

function imagePrompt(item) {
  const g = session.answers.gender;
  const who = g === "Women's" ? "women's " : g === "Men's" ? "men's " : '';
  const color = item.colors[0] ? `${item.colors[0]} ` : '';
  return `Professional e-commerce product photo of a ${color}${who}${item.name.toLowerCase()}. ${item.description} The item shown alone and centered, ghost-mannequin or neat flat-lay style, on a plain warm off-white studio background, soft even lighting, crisp fabric texture, high-end catalog photography. No person, no face, no text, no logos, no watermark.`;
}

// Real products when a Serper key is set (or were saved earlier), otherwise an AI preview.
function mediaFor(item) {
  const products = item.products || cachedProducts(item.query);
  if (products?.length || (settings.serperKey && !productsFailed(item.query))) return { kind: 'products', products };
  const image = item.image || cachedImage(savedKey(item));
  if (image || (settings.aiImages && settings.apiKey && !imageFailed(savedKey(item)))) return { kind: 'image', image };
  return { kind: 'none' };
}

const imageHtml = src => `<img src="${esc(src)}" alt="" loading="lazy"><span class="badge-ai">AI preview</span>`;
const productsHtml = list =>
  list.length
    ? list
        .map(
          p => `<a class="product" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">
            <span class="product-img"><img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>
            <span class="product-title">${esc(p.title)}</span>
            <span class="product-meta"><b>${esc(p.price)}</b> ${esc(p.source)}</span>
          </a>`
        )
        .join('')
    : `<p class="sub">No matching products found. Try the store links below.</p>`;

function hydrateMedia(root) {
  root.querySelectorAll('[data-img]:not([data-done])').forEach(el => {
    el.dataset.done = '1';
    const key = el.dataset.img;
    const item = session.results?.items.find(i => savedKey(i) === key) || saved.find(i => i.key === key);
    if (!item) return;
    generateImage(key, imagePrompt(item), { apiKey: settings.apiKey.trim(), model: settings.imageModel })
      .then(src => document.querySelectorAll(`[data-img="${CSS.escape(key)}"]`).forEach(m => {
        m.classList.remove('pending');
        m.innerHTML = imageHtml(src);
      }))
      .catch(() => document.querySelectorAll(`[data-img="${CSS.escape(key)}"]`).forEach(m => m.remove()));
  });
  root.querySelectorAll('[data-products]:not([data-done])').forEach(el => {
    el.dataset.done = '1';
    const query = el.dataset.products;
    searchProducts(query, settings.serperKey.trim())
      .then(list => document.querySelectorAll(`[data-products="${CSS.escape(query)}"]`).forEach(m => {
        m.classList.remove('pending');
        m.innerHTML = productsHtml(list);
      }))
      .catch(() => document.querySelectorAll(`[data-products="${CSS.escape(query)}"]`).forEach(m => m.closest('.products-wrap')?.remove()));
  });
}

function itemCard(item, { savedView = false } = {}) {
  const key = savedKey(item);
  const isSaved = saved.some(s => s.key === key);
  const links = item.links || itemLinks(item);
  const media = mediaFor(item);
  const hero =
    media.kind === 'image'
      ? media.image
        ? `<div class="item-img">${imageHtml(media.image)}</div>`
        : `<div class="item-img pending" data-img="${esc(key)}"></div>`
      : '';
  const productRow =
    media.kind === 'products'
      ? `<div class="products-wrap"><p class="shop-label">Real products</p>${
          media.products
            ? `<div class="products">${productsHtml(media.products)}</div>`
            : `<div class="products pending" data-products="${esc(item.query)}">${'<span class="product skeleton"></span>'.repeat(3)}</div>`
        }</div>`
      : '';
  return `
    <article class="item">
      ${hero}
      <header>
        <span class="cat">${esc(item.category)}</span>
        ${item.price ? `<span class="price">${esc(item.price)}</span>` : ''}
        <button class="heart" data-act="${savedView ? 'unsave' : 'toggle-save'}" data-key="${esc(key)}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from saved' : 'Save item'}">${HEART_SVG}</button>
      </header>
      <h3>${esc(item.name)}</h3>
      ${item.description ? `<p class="desc">${esc(item.description)}</p>` : ''}
      ${item.why ? `<p class="why">${esc(item.why)}</p>` : ''}
      ${item.colors?.length ? `<div class="colors">${item.colors.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
      ${productRow}
      <p class="shop-label">${media.kind === 'products' ? 'Search stores' : 'Shop it'}</p>
      <div class="links">${links
        .map(l => `<a class="${l.google ? 'google' : ''}" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.name)}${ARROW_SVG}</a>`)
        .join('')}</div>
    </article>`;
}

function renderResults() {
  if (ui.loading === 'results') return renderLoading('Pulling your picks together', ['Matching pieces to your style…', 'Checking what fits your budget…', 'Finding stores that carry them…', 'Putting it all together…']);
  if (ui.loading === 'refine') return renderLoading('Reworking your picks', ['Taking your notes on board…', 'Swapping things around…', 'Almost there…']);
  if (ui.error && !session.results) return renderError('retry-results');
  if (!session.results || session.resultsFor !== resultsKey()) return void loadResults();

  const r = session.results;
  const brief = QUESTIONS.filter(q => q.type !== 'form')
    .flatMap(q => selectedValues(q))
    .slice(0, 14);
  $view.innerHTML = `
    <section class="screen results">
      ${ui.error ? `<div class="note warn">${esc(ui.error)}</div>` : ''}
      <p class="eyebrow">Your edit</p>
      <h1 class="display">${esc(r.headline)}</h1>
      ${r.summary ? `<p class="lede">${esc(r.summary)}</p>` : ''}
      <div class="brief">${brief.map(b => `<span>${esc(b)}</span>`).join('')}<button class="link" data-act="edit">Edit answers</button></div>
      <div class="items">${r.items.map(i => itemCard(i)).join('')}</div>
      ${r.tips.length ? `<div class="tips"><h2>Styling tips</h2><ul>${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="refine">
        <h2>Not quite right?</h2>
        <div class="chips small">${['Cheaper', 'More trendy', 'More classic', 'Different stores', 'Show other options', 'More color']
          .map(c => `<button class="opt" data-refine="${esc(c)}">${esc(c)}</button>`)
          .join('')}</div>
        <form id="refine-form" class="refine-form">
          <input id="refine-input" type="text" placeholder="e.g. swap the shoes for boots" autocomplete="off" enterkeyhint="send">
          <button class="btn primary" type="submit">Update</button>
        </form>
      </div>
      <p class="fineprint">${settings.serperKey ? 'Real products come from Google Shopping. ' : settings.aiImages ? 'Photos are AI previews of the style, not the exact product. ' : ''}Store links open each shop's search for the item, since stock changes daily.</p>
    </section>`;
  setActions('');
  hydrateMedia($view);
  $('#refine-form').addEventListener('submit', e => {
    e.preventDefault();
    refine($('#refine-input').value);
  });
}

function renderSaved() {
  const body = saved.length
    ? saved.map(s => itemCard(s, { savedView: true })).join('')
    : `<div class="empty"><p>Nothing saved yet.</p><p class="sub">Tap the heart on any recommendation to keep it here.</p></div>`;
  $('#saved-body').innerHTML = body;
  hydrateMedia($('#saved-body'));
}

// ---------- Saved items ----------

function toggleSave(key) {
  const idx = saved.findIndex(s => s.key === key);
  if (idx >= 0) {
    saved.splice(idx, 1);
    toast('Removed from saved');
  } else {
    const item = session.results?.items.find(i => savedKey(i) === key);
    if (!item) return;
    const image = cachedImage(key);
    const products = cachedProducts(item.query);
    saved.unshift({ ...item, key, links: itemLinks(item), ...(image && { image }), ...(products && { products: products.slice(0, 4) }), savedAt: Date.now() });
    toast('Saved');
  }
  save(KEYS.saved, saved);
  renderHeader();
  document.querySelectorAll(`.heart[data-key="${CSS.escape(key)}"]`).forEach(b => b.setAttribute('aria-pressed', idx < 0));
  if ($('#saved-dialog').open) renderSaved();
}

// ---------- Settings ----------

function openSettings(message) {
  $('#settings-msg').textContent = message || '';
  $('#settings-msg').hidden = !message;
  $('#api-key').value = settings.apiKey;
  $('#model').value = settings.model;
  $('#ai-images').checked = settings.aiImages;
  $('#serper-key').value = settings.serperKey;
  $('#image-model').value = settings.imageModel;
  $('#test-result').textContent = '';
  $('#settings-dialog').showModal();
}

function saveSettings() {
  settings = {
    apiKey: $('#api-key').value.trim(),
    model: $('#model').value.trim() || DEFAULT_MODEL,
    aiImages: $('#ai-images').checked,
    serperKey: $('#serper-key').value.trim(),
    imageModel: $('#image-model').value.trim() || DEFAULT_IMAGE_MODEL,
  };
  save(KEYS.settings, settings);
}

async function testConnection() {
  saveSettings();
  const out = $('#test-result');
  if (!settings.apiKey) {
    out.textContent = 'Enter an API key first.';
    return;
  }
  out.textContent = 'Testing…';
  try {
    await chat([{ role: 'user', content: 'Reply with the word OK.' }], { maxTokens: 200, json: false });
    out.textContent = 'Connected. You are good to go.';
  } catch (e) {
    out.textContent = e.name === 'AbortError' ? '' : e.message;
  }
}

// ---------- Misc ----------

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

const HANGER_SVG = `<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 40V30A8 8 0 1 0 52.5 19.3"/><path d="M60 40 10 66c-4 2-3 7 2 7h96c5 0 6-5 2-7L60 40"/></svg>`;
const HEART_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.3 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>`;
const ARROW_SVG = `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------- Events ----------

document.addEventListener('click', e => {
  const opt = e.target.closest('.opt[data-v]');
  if (opt && session.view === 'q') return toggleOption(QUESTIONS[session.step], opt.dataset.v);
  if (opt?.dataset.f) return toggleFollowup(opt.dataset.f, opt.dataset.v);
  const ref = e.target.closest('[data-refine]');
  if (ref) return refine(ref.dataset.refine);

  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  switch (act) {
    case 'start':
      return go('q', 0);
    case 'resume':
      return go(session.results ? 'results' : 'q');
    case 'fresh':
      session = newSession();
      return go('q', 0);
    case 'next':
      return advance();
    case 'skip':
      delete session.answers[QUESTIONS[session.step].id];
      return advance();
    case 'cancel': {
      const wasRefine = ui.loading === 'refine';
      cancelLoading();
      return wasRefine ? render() : back();
    }
    case 'settings':
      return openSettings();
    case 'retry-followup':
      ui.error = null;
      return loadFollowups();
    case 'retry-results':
      ui.error = null;
      return loadResults();
    case 'skip-followup':
      session.followupAnswers = {};
      if (!session.followups) session.followups = [];
      session.followupsFor = answersKey();
      return go('results');
    case 'to-results':
      return go('results');
    case 'edit':
      return go('q', 0);
    case 'toggle-save':
    case 'unsave':
      return toggleSave(btn.dataset.key);
  }
});

$('#back').addEventListener('click', back);
$('#home').addEventListener('click', () => go('welcome'));
$('#open-settings').addEventListener('click', () => openSettings());
$('#open-saved').addEventListener('click', () => {
  renderSaved();
  $('#saved-dialog').showModal();
});
$('#settings-form').addEventListener('submit', () => {
  saveSettings();
  render();
  if (ui.resumeAfterKey && settings.apiKey) {
    ui.resumeAfterKey = false;
    finishQuestions();
  }
});
$('#test-key').addEventListener('click', testConnection);
$('#reset-model').addEventListener('click', () => ($('#model').value = DEFAULT_MODEL));
document.querySelectorAll('[data-reveal]').forEach(btn => btn.addEventListener('click', e => {
  const input = $(`#${btn.dataset.reveal}`);
  input.type = input.type === 'password' ? 'text' : 'password';
  e.currentTarget.textContent = input.type === 'password' ? 'Show' : 'Hide';
}));
$('#clear-data').addEventListener('click', () => {
  if (!confirm('Clear your answers, results and saved items? Your API key stays.')) return;
  session = newSession();
  saved = [];
  save(KEYS.saved, saved);
  $('#settings-dialog').close();
  go('welcome');
});
document.querySelectorAll('dialog').forEach(d =>
  d.addEventListener('click', e => {
    if (e.target === d) d.close();
  })
);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

render();
