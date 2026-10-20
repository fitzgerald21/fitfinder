# Fitfinder

A mobile-first web app that helps you figure out where to buy clothes you'll like. Answer a few questions (who you're shopping for, age, occasion, what pieces you want, trendiness, style vibes, fit, colors, budget), answer 3 AI-tailored follow-ups, and get a list of specific pieces with links to shops that carry them.

## Setup

1. Open the app (GitHub Pages) on your phone.
2. Tap the settings icon and paste a [DeepInfra API key](https://deepinfra.com/dash/api_keys). It's kept in your browser's local storage and only sent to DeepInfra.
3. Optional: add it to your home screen (Share → Add to Home Screen) so it opens like an app.

The default model is `deepseek-ai/DeepSeek-V4.1-Flash-1017`. You can change it in Settings to any chat model on DeepInfra.

## How links work

The AI never writes URLs. It picks stores from a curated list in `stores.js` and writes a search query for each item; the app turns those into links to each store's own search page (or a Google search scoped to that store when it has no stable search URL), plus a Google Shopping link. Links always open a real page, and you see current stock and prices.

To add or change a store, edit `stores.js`.

## Files

- `index.html`, `styles.css`, `app.js`: the app (no build step)
- `stores.js`: store catalog and link building
- `sw.js`, `manifest.webmanifest`, `icons/`: installable app and offline shell

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
