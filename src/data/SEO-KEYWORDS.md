# SEO keyword configuration

Add target keywords when the site owner supplies them. Keep the page copy natural; do not stuff keyword lists into visible content.

- **Game pages:** edit each record's `keywords` array in `games.json`. The first item becomes the page's title override; the page's description, canonical, Open Graph, Twitter metadata, and JSON-LD are generated from the record.
- **Articles:** edit the article's `keywords` array in `blog.json`.
- **Site-wide defaults:** edit `keywords` and canonical URL in `site.json`.
- **New pages:** pass a `keywords` array to `BaseLayout.astro` and provide a unique title, description, and canonical path.

Keyword configuration should not be treated as a replacement for helpful page content, unique titles, accurate descriptions, or internal links.
