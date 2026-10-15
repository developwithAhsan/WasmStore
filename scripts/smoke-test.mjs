import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'src/data/games.json'), 'utf8'));
const articles = JSON.parse(await fs.readFile(path.join(root, 'src/data/blog.json'), 'utf8'));
const fail = [];
const check = async (relative, label = relative) => {
  try { await fs.access(path.join(dist, relative)); }
  catch { fail.push(`Missing generated output: ${label} (${relative})`); }
};
const read = async (relative) => fs.readFile(path.join(dist, relative), 'utf8');

await check('index.html');
await check('404.html');
await check('games/index.html');
await check('categories/index.html');
await check('tags/index.html');
await check('blog/index.html');
await check('guides/index.html');
await check('about/index.html');
await check('contact/index.html');
await check('privacy/index.html');
await check('terms/index.html');
await check('dmca/index.html');
await check('favorites/index.html');
await check('robots.txt');
await check('sitemap-index.xml');
await check('styles/portal.css');
await check('scripts/site.js');
await check('favicon.svg');
await check('images/wasmstore-social.svg');

const allSlugs = new Set();
const allTitles = new Map();
for (const game of catalog.games) {
  if (allSlugs.has(game.slug)) fail.push(`Duplicate game slug: ${game.slug}`);
  allSlugs.add(game.slug);
  const file = `games/${game.slug}/index.html`;
  await check(file, `game page ${game.name}`);
  try {
    const html = await read(file);
    for (const [needle, label] of [
      ['<title>', 'title tag'],
      ['name="description"', 'meta description'],
      ['rel="canonical"', 'canonical URL'],
      ['property="og:title"', 'Open Graph title'],
      ['name="twitter:card"', 'Twitter card'],
      ['"@type":"VideoGame"', 'VideoGame JSON-LD'],
      ['data-disqus', 'per-game comments container']
    ]) if (!html.includes(needle)) fail.push(`${game.slug}: missing ${label}`);
    const title = (html.match(/<title>(.*?)<\/title>/s) || [])[1];
    if (title) {
      if (allTitles.has(title)) fail.push(`Duplicate page title "${title}" on ${allTitles.get(title)} and ${game.slug}`);
      else allTitles.set(title, game.slug);
    }
  } catch {}
}
const categorySlugs = [...new Set(catalog.games.map(g=>g.category.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')))];
for (const slug of categorySlugs) await check(`categories/${slug}/index.html`, `category archive ${slug}`);
const tagSlugs = [...new Set(catalog.games.flatMap(g=>g.tags))];
for (const slug of tagSlugs) await check(`tags/${slug}/index.html`, `tag archive ${slug}`);
for (const post of articles) await check(`blog/${post.slug}/index.html`, `article ${post.slug}`);

try {
  const index = await read('sitemap-index.xml');
  const sitemapFiles = [...index.matchAll(/<loc>[^<]*\/(sitemap[^<]*\.xml)<\/loc>/g)].map(m=>m[1]);
  if (!sitemapFiles.length) fail.push('Sitemap index contains no child sitemap URLs');
  let sitemapText = index;
  for (const file of sitemapFiles) {
    try { sitemapText += await read(file); } catch { fail.push(`Missing sitemap file ${file}`); }
  }
  for (const game of catalog.games) if (!sitemapText.includes(`/games/${game.slug}`)) fail.push(`Sitemap missing game URL ${game.slug}`);
} catch {}

console.log(`Smoke test: ${catalog.games.length} game pages, ${categorySlugs.length} categories, ${tagSlugs.length} tags, ${articles.length} articles checked.`);
if (fail.length) {
  console.error(`FAILED with ${fail.length} issue(s):\n- ${fail.slice(0,80).join('\n- ')}`);
  process.exit(1);
}
console.log('PASS: required routes, SEO tags, game schema, comments containers, and sitemap entries are present.');
