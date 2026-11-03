# hygoal-seo-work changes (2026-11-03)

Isolated copy of D:\\WebCode\\GItCode\\Website. Original folder was not modified.

## What changed for SEO

1. `scripts/prerender-routes.mjs` — after Vite build, writes `about/index.html`, `products/index.html`, `products/<id>/index.html`, etc. with per-route title/description/canonical/og + Product JSON-LD. GitHub Pages then returns HTTP 200 for clean URLs.
2. `scripts/generate-sitemap.mjs` — BASE_URL set to `https://www.hygoal.com/`.
3. `apps/web/index.html` — static title/description/canonical/og aligned with the client homepage Helmet.
4. Root `package.json` build now runs: sitemap → vite build → prerender.

## Local verify

```
cd D:\\hygoal-seo-work
npm ci
npm run build
```

Then open `dist/apps/web/products/6400-a/index.html` and confirm it has the product title in the raw HTML.

## Still TODO (not in this pass)

- Old CMS URL 301 map (needs hosting that supports redirects, or a `_redirects`/`vercel.json` after leaving pure GH Pages tricks)
- Category landing pages (`/indexing-plunger`, etc.)
