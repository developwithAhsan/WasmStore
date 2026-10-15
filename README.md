# WasmStore — Astro browser game directory

WasmStore is a static, data-driven browser-game discovery portal. It uses Astro to generate crawlable HTML for every catalog record, category, tag, and editorial article.

## Stack

- **Astro 5 / static output:** fast, pre-rendered pages without a server for each visit.
- **TypeScript + JSON catalog:** game metadata is separate from page templates.
- **Astro sitemap integration:** creates sitemap files from generated routes.
- **Vanilla client-side JavaScript:** search, filtering, sorting, favorites, recently played, player launch, and fullscreen without a heavy UI runtime.
- **Netlify:** static build output is published from `dist/`.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

## Add or update a game

Edit `src/data/games.json`. Each record contains a unique `slug`, name, category, tags, optional demo URL, optional source repository URL, controls notes, attribution, license status, and an editable `keywords` array. The build creates `/games/<slug>` automatically; do not create a hand-written page for each game.

- Use a real, stable slug and keep it unique.
- Only fill `demoUrl` when a source catalog or maintainer provides a demo link.
- A demo link is not proof that an iframe will work or that a game is available today. The game page includes an external fallback.
- Review the upstream code license and game-asset rights before self-hosting or redistributing anything. A code license may not cover game artwork, music, ROMs, or other content.
- Update category/tags and title-specific controls when verified.
- Populate `keywords` only when target terms are supplied and reviewed. The first keyword, if present, is used as the game page title; the rest can be extended through the SEO helpers without editing templates.

 The live catalog is intentionally limited to six curated titles. GTA: Chinatown Wars is listed as coming soon because no verified browser demo is currently linked. Records are not a grant to copy or redistribute any game. The catalog's `sourceCatalog` and `attribution` fields preserve provenance.

## Upstream license audit

Run `npm run audit:licenses` to check GitHub repository metadata for declared code licenses and annotate catalog entries with audit status. Set a GitHub personal access token in the `GITHUB_TOKEN` environment variable to avoid unauthenticated API rate limits. The script updates `src/data/games.json`; review the diff before committing it.

This is a first-pass metadata check, not legal clearance. Manually inspect projects with no declared license, non-GitHub source hosts, missing repositories, or failed lookups. Verify game assets, music, trademarks, ROMs, and bundled commercial content separately; a code license does not necessarily cover those assets.

## Editorial content

Edit `src/data/blog.json` to add articles. Each entry becomes a dedicated `/blog/<slug>` page. The home page automatically shows the first three articles; the full blog and guides pages are data-driven.

## SEO configuration

- Site URL, Disqus shortname, contact email, custom-domain placeholder, and future keyword defaults live in `src/data/site.json`.
- Per-game keywords live in `src/data/games.json`; article keywords live in `src/data/blog.json`.
- Each page has a unique title and description, canonical URL, Open Graph/Twitter metadata, and JSON-LD. Game pages include VideoGame and BreadcrumbList structured data.
- The Astro sitemap integration emits `sitemap-index.xml` and sitemap files during build. `public/robots.txt` references the sitemap index.
- The configured canonical host is currently `https://wasmstore.netlify.app`. Replace it with the final production/custom domain in both `astro.config.mjs` and `src/data/site.json` before launch.

## Disqus and contact

Set `disqusShortname` in `src/data/site.json` to your actual Disqus shortname. Until then, comments stay inactive. Each game uses its unique slug as the discussion identifier and its canonical page URL.

Set `contactEmail` in the same file to a monitored inbox. The contact form prepares an email draft and does not transmit submissions to a backend.

## Netlify deployment

1. Connect the repository to Netlify and choose the `production-astro-portal` branch for a preview, or merge it into the production branch after review.
2. Build command: `npm run build`; publish directory: `dist`; Node: 22.
3. Add your final custom domain in Netlify, then update `site.url` in `astro.config.mjs` and `src/data/site.json`.
4. Verify sitemap, robots, canonical URLs, the contact inbox, Disqus configuration, and a sample of external demos after deploy.

## Security headers and cross-origin isolation

`netlify.toml` sets baseline security headers and immutable caching for fingerprinted Astro assets. COOP/COEP are **not enabled globally** because cross-origin isolation can break third-party game iframes and assets. A self-hosted, threaded WASM title may require a dedicated route with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`; only enable those headers after verifying that every asset supports the required CORS/CORP policy.

## Important production checks

- Verify the demo URL and iframe policy for each featured game. Third-party hosts can change or go offline.
- Review licenses before copying any upstream source or assets into this repository.
- Configure real contact details and the Disqus shortname.
- Check mobile layouts and keyboard navigation on representative pages.
- Keep privacy, terms, and DMCA text aligned with the actual providers and applicable law.
