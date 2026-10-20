// Photos for recommended items:
//   - AI previews: a generated product shot per item, via a DeepInfra image model.
//   - Real products: Google Shopping results (photo, price, store, link) via Serper.dev.
// Both are cached in localStorage so re-renders and reloads don't pay again.

export const DEFAULT_IMAGE_MODEL = 'black-forest-labs/FLUX-2-klein-4b';
const KEYS = { images: 'fitfinder.images', products: 'fitfinder.products' };

function loadCache(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

// Keeps the newest `max` entries, halving further if storage is full.
function writeCache(key, cache, max) {
  const entries = Object.entries(cache).sort((a, b) => b[1].t - a[1].t).slice(0, max);
  for (let n = entries.length; n > 0; n = Math.floor(n / 2)) {
    try {
      localStorage.setItem(key, JSON.stringify(Object.fromEntries(entries.slice(0, n))));
      return;
    } catch {}
  }
}

const images = loadCache(KEYS.images);
const products = loadCache(KEYS.products);
const inflight = new Map();
const failed = new Set();

// At most 3 requests at a time so a 10-item list doesn't hit rate limits.
let active = 0;
const queue = [];
function limit(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    pump();
  });
}
function pump() {
  while (active < 3 && queue.length) {
    const { fn, resolve, reject } = queue.shift();
    active++;
    fn().then(resolve, reject).finally(() => {
      active--;
      pump();
    });
  }
}

function once(key, fn) {
  if (inflight.has(key)) return inflight.get(key);
  const p = fn()
    .catch(e => {
      failed.add(key);
      throw e;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

const productKey = query => query.trim().toLowerCase();

export const cachedImage = key => images[key]?.v || null;
export const cachedProducts = query => products[productKey(query)]?.v || null;
export const imageFailed = key => failed.has(`img:${key}`);
export const productsFailed = query => failed.has(`p:${productKey(query)}`);

// Re-encode as a small JPEG so a list of images fits comfortably in localStorage.
function shrink(src, size = 448) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, size / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export function generateImage(key, prompt, { apiKey, model }) {
  return once(`img:${key}`, () =>
    limit(async () => {
      const res = await fetch(`https://api.deepinfra.com/v1/inference/${model || DEFAULT_IMAGE_MODEL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ prompt, width: 512, height: 512 }),
      });
      if (!res.ok) throw new Error(`Image request failed (${res.status})`);
      const data = await res.json();
      let src = data.images?.[0] || data.data?.[0]?.url || '';
      if (!src && data.data?.[0]?.b64_json) src = `data:image/png;base64,${data.data[0].b64_json}`;
      if (!src) throw new Error('No image returned');
      const small = await shrink(src);
      images[key] = { v: small, t: Date.now() };
      writeCache(KEYS.images, images, 40);
      return small;
    })
  );
}

const safeUrl = u => (/^https?:\/\//i.test(u || '') ? u : '');
const safeImage = u => (/^(https?:\/\/|data:image\/)/i.test(u || '') ? u : '');

export function searchProducts(query, serperKey) {
  const key = productKey(query);
  return once(`p:${key}`, () =>
    limit(async () => {
      const res = await fetch('https://google.serper.dev/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
        body: JSON.stringify({ q: query, gl: 'us', hl: 'en' }),
      });
      if (!res.ok) throw new Error(`Product search failed (${res.status})`);
      const data = await res.json();
      const list = (data.shopping || [])
        .map(p => ({ title: String(p.title || ''), source: String(p.source || ''), price: String(p.price || ''), image: safeImage(p.imageUrl), link: safeUrl(p.link) }))
        .filter(p => p.title && p.image && p.link)
        .slice(0, 6);
      products[key] = { v: list, t: Date.now() };
      writeCache(KEYS.products, products, 60);
      return list;
    })
  );
}
