// Stores the AI can pick from. Links are built here from search queries, never
// from AI-generated URLs, so every link opens a real page.
//   url:  store's own search page ({q} = encoded query)
//   site: no reliable search URL, so fall back to a Google search scoped to the site
//   g:    w = women's, m = men's, u = unisex/both
export const STORES = [
  // Department stores & multi-brand
  { id: 'nordstrom', name: 'Nordstrom', tier: '$$–$$$$', g: 'wmu', note: 'department store, huge brand range', url: 'https://www.nordstrom.com/sr?keyword={q}' },
  { id: 'nordstromrack', name: 'Nordstrom Rack', tier: '$–$$', g: 'wmu', note: 'off-price designer and mall brands', url: 'https://www.nordstromrack.com/sr?keyword={q}' },
  { id: 'macys', name: "Macy's", tier: '$–$$$', g: 'wmu', note: 'department store, suits, dresses, basics', url: 'https://www.macys.com/shop/search?keyword={q}' },
  { id: 'bloomingdales', name: "Bloomingdale's", tier: '$$–$$$$', g: 'wmu', note: 'upscale department store', site: 'bloomingdales.com' },
  { id: 'saks', name: 'Saks Fifth Avenue', tier: '$$$–$$$$', g: 'wmu', note: 'luxury designer', site: 'saksfifthavenue.com' },
  { id: 'ssense', name: 'SSENSE', tier: '$$$–$$$$', g: 'wmu', note: 'directional designer and luxury streetwear', site: 'ssense.com' },
  { id: 'farfetch', name: 'Farfetch', tier: '$$$–$$$$', g: 'wmu', note: 'luxury boutiques worldwide', site: 'farfetch.com' },
  { id: 'netaporter', name: 'NET-A-PORTER', tier: '$$$–$$$$', g: 'w', note: "women's luxury", site: 'net-a-porter.com' },
  { id: 'mrporter', name: 'MR PORTER', tier: '$$$–$$$$', g: 'm', note: "men's luxury and tailoring", site: 'mrporter.com' },
  { id: 'revolve', name: 'Revolve', tier: '$$–$$$', g: 'wm', note: 'trendy, going-out, vacation', url: 'https://www.revolve.com/r/Search.jsp?search={q}' },
  { id: 'asos', name: 'ASOS', tier: '$–$$', g: 'wmu', note: 'trendy, huge selection, petite/tall/plus', url: 'https://www.asos.com/us/search/?q={q}' },
  { id: 'target', name: 'Target', tier: '$', g: 'wmu', note: 'budget basics', url: 'https://www.target.com/s?searchTerm={q}' },
  { id: 'amazon', name: 'Amazon', tier: '$–$$$', g: 'wmu', note: 'everything, fast shipping', url: 'https://www.amazon.com/s?k={q}' },

  // Mall & specialty brands
  { id: 'zara', name: 'Zara', tier: '$–$$', g: 'wm', note: 'fast, trend-driven', url: 'https://www.zara.com/us/en/search?searchTerm={q}' },
  { id: 'hm', name: 'H&M', tier: '$', g: 'wmu', note: 'cheap trends and basics', url: 'https://www2.hm.com/en_us/search-results.html?q={q}' },
  { id: 'mango', name: 'Mango', tier: '$–$$', g: 'wm', note: 'polished European trends', site: 'mango.com' },
  { id: 'cos', name: 'COS', tier: '$$', g: 'wmu', note: 'minimal, architectural', site: 'cos.com' },
  { id: 'uniqlo', name: 'Uniqlo', tier: '$', g: 'wmu', note: 'quality basics, technical fabrics', url: 'https://www.uniqlo.com/us/en/search?q={q}' },
  { id: 'everlane', name: 'Everlane', tier: '$$', g: 'wm', note: 'modern basics, transparent pricing', site: 'everlane.com' },
  { id: 'quince', name: 'Quince', tier: '$–$$', g: 'wm', note: 'affordable cashmere, silk, linen', site: 'quince.com' },
  { id: 'jcrew', name: 'J.Crew', tier: '$$', g: 'wm', note: 'classic, preppy', url: 'https://www.jcrew.com/r/search/?N=0&Nloc=en&Ntrm={q}' },
  { id: 'madewell', name: 'Madewell', tier: '$$', g: 'wm', note: 'denim, relaxed everyday', url: 'https://www.madewell.com/search?q={q}' },
  { id: 'gap', name: 'Gap', tier: '$–$$', g: 'wmu', note: 'American basics, denim', url: 'https://www.gap.com/browse/search.do?searchText={q}' },
  { id: 'oldnavy', name: 'Old Navy', tier: '$', g: 'wmu', note: 'budget family basics, extended sizes', url: 'https://oldnavy.gap.com/browse/search.do?searchText={q}' },
  { id: 'bananarepublic', name: 'Banana Republic', tier: '$$', g: 'wm', note: 'elevated workwear', url: 'https://bananarepublic.gap.com/browse/search.do?searchText={q}' },
  { id: 'abercrombie', name: 'Abercrombie & Fitch', tier: '$$', g: 'wm', note: 'polished casual, denim, tall/short lengths', url: 'https://www.abercrombie.com/shop/us/search?searchTerm={q}' },
  { id: 'urbanoutfitters', name: 'Urban Outfitters', tier: '$–$$', g: 'wmu', note: 'young, vintage-inspired, Y2K', url: 'https://www.urbanoutfitters.com/search?q={q}' },
  { id: 'anthropologie', name: 'Anthropologie', tier: '$$–$$$', g: 'w', note: 'romantic, eclectic', url: 'https://www.anthropologie.com/search?q={q}' },
  { id: 'freepeople', name: 'Free People', tier: '$$', g: 'w', note: 'boho', url: 'https://www.freepeople.com/search?q={q}' },
  { id: 'aritzia', name: 'Aritzia', tier: '$$–$$$', g: 'w', note: 'elevated modern womenswear', site: 'aritzia.com' },
  { id: 'reformation', name: 'Reformation', tier: '$$–$$$', g: 'w', note: 'sustainable, feminine dresses', site: 'thereformation.com' },

  // Menswear & tailoring
  { id: 'toddsnyder', name: 'Todd Snyder', tier: '$$–$$$', g: 'm', note: 'elevated American menswear', site: 'toddsnyder.com' },
  { id: 'bonobos', name: 'Bonobos', tier: '$$', g: 'm', note: "men's fit-focused pants and suits", site: 'bonobos.com' },
  { id: 'suitsupply', name: 'Suitsupply', tier: '$$–$$$', g: 'm', note: 'suits and tailoring', site: 'suitsupply.com' },
  { id: 'brooksbrothers', name: 'Brooks Brothers', tier: '$$–$$$', g: 'wm', note: 'traditional business wear', site: 'brooksbrothers.com' },

  // Active & outdoor
  { id: 'lululemon', name: 'lululemon', tier: '$$–$$$', g: 'wm', note: 'premium activewear and athleisure', url: 'https://shop.lululemon.com/search?Ntt={q}' },
  { id: 'nike', name: 'Nike', tier: '$–$$$', g: 'wmu', note: 'athletic, sneakers', url: 'https://www.nike.com/w?q={q}' },
  { id: 'adidas', name: 'adidas', tier: '$–$$', g: 'wmu', note: 'athletic, sneakers, retro sport', url: 'https://www.adidas.com/us/search?q={q}' },
  { id: 'rei', name: 'REI', tier: '$$–$$$', g: 'wmu', note: 'outdoor and hiking gear', url: 'https://www.rei.com/search?q={q}' },
  { id: 'patagonia', name: 'Patagonia', tier: '$$–$$$', g: 'wmu', note: 'outdoor, sustainable', site: 'patagonia.com' },
  { id: 'llbean', name: 'L.L.Bean', tier: '$$', g: 'wmu', note: 'outdoor classics, durable', site: 'llbean.com' },

  // Shoes
  { id: 'zappos', name: 'Zappos', tier: '$–$$$', g: 'wmu', note: 'shoes, free returns', url: 'https://www.zappos.com/search?term={q}' },
  { id: 'dsw', name: 'DSW', tier: '$–$$', g: 'wmu', note: 'affordable shoes', site: 'dsw.com' },

  // Extended sizes
  { id: 'torrid', name: 'Torrid', tier: '$$', g: 'w', note: "women's plus size", site: 'torrid.com' },
  { id: 'eloquii', name: 'Eloquii', tier: '$$', g: 'w', note: "women's plus size, trend-led", site: 'eloquii.com' },
  { id: 'dxl', name: 'DXL', tier: '$$', g: 'm', note: "men's big & tall", site: 'dxl.com' },

  // Secondhand & resale
  { id: 'ebay', name: 'eBay', tier: '$–$$$', g: 'wmu', note: 'new and used, vintage', url: 'https://www.ebay.com/sch/i.html?_nkw={q}' },
  { id: 'poshmark', name: 'Poshmark', tier: '$–$$', g: 'wmu', note: 'secondhand mall and designer brands', url: 'https://poshmark.com/search?query={q}' },
  { id: 'depop', name: 'Depop', tier: '$–$$', g: 'wmu', note: 'secondhand, vintage, Y2K', url: 'https://www.depop.com/search/?q={q}' },
  { id: 'thredup', name: 'thredUP', tier: '$', g: 'wm', note: 'cheap secondhand', site: 'thredup.com' },
  { id: 'therealreal', name: 'The RealReal', tier: '$$–$$$$', g: 'wmu', note: 'authenticated luxury resale', site: 'therealreal.com' },
  { id: 'grailed', name: 'Grailed', tier: '$$–$$$', g: 'mu', note: 'menswear and streetwear resale', site: 'grailed.com' },
];

const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const LOOKUP = new Map();
for (const s of STORES) {
  LOOKUP.set(norm(s.id), s);
  LOOKUP.set(norm(s.name), s);
}

// Accepts an id or a store name, since models sometimes return either.
export function findStore(idOrName) {
  return LOOKUP.get(norm(idOrName)) || null;
}

export function storeLink(store, query) {
  if (store.url) return store.url.replace('{q}', encodeURIComponent(query));
  return 'https://www.google.com/search?q=' + encodeURIComponent(`site:${store.site} ${query}`);
}

export function googleShoppingLink(query) {
  return 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(query);
}

export function storeListForPrompt() {
  return STORES.map(s => `${s.id} — ${s.name} — ${s.tier} — ${s.g} — ${s.note}`).join('\n');
}
