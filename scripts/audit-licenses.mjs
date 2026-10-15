import fs from 'node:fs/promises';

const catalogPath = new URL('../src/data/games.json', import.meta.url);
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const token = process.env.GITHUB_TOKEN;
const seen = new Map();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function githubRepo(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const [owner, repo] = parts;
    if (['tree','blob','issues','pulls','releases','wiki','actions'].includes(owner.toLowerCase())) return null;
    return { owner, repo: repo.replace(/\.git$/,'') };
  } catch { return null; }
}

async function fetchLicense(repo) {
  const url = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}`;
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'WasmStore-license-audit' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await fetch(url, { headers });
    if (response.status === 404) return { status: 'repository-not-found-or-private', license: null, licenseUrl: null };
    if (response.status === 403 || response.status === 429) throw new Error(`GitHub rate limit/permission response (${response.status}); set GITHUB_TOKEN and retry.`);
    if (!response.ok) return { status: `http-${response.status}`, license: null, licenseUrl: null };
    const data = await response.json();
    return data.license?.spdx_id && data.license.spdx_id !== 'NOASSERTION'
      ? { status: 'metadata-license-found', license: data.license.spdx_id, licenseUrl: data.html_url || data.url || null }
      : { status: 'no-license-declared-in-repository-metadata', license: null, licenseUrl: data.html_url || null };
  } catch (error) {
    if (/rate limit|permission response/.test(String(error))) throw error;
    return { status: 'lookup-failed', license: null, licenseUrl: null };
  }
}

const repos = new Map();
for (const game of catalog.games) {
  const repo = githubRepo(game.repositoryUrl);
  if (repo) repos.set(`${repo.owner}/${repo.repo}`, repo);
}
console.log(`Checking GitHub metadata for ${repos.size} unique repositories. A declared code license does not automatically cover game assets.`);
let index = 0;
for (const [key, repo] of repos) {
  if (seen.has(key)) continue;
  if (index > 0) await wait(token ? 80 : 1100);
  const result = await fetchLicense(repo);
  seen.set(key, result);
  index++;
  if (index % 25 === 0) console.log(`Checked ${index}/${repos.size}`);
}
for (const game of catalog.games) {
  const repo = githubRepo(game.repositoryUrl);
  if (!repo) {
    game.licenseAudit = { status: game.repositoryUrl ? 'manual-review-non-github-host' : 'manual-review-no-source-repository', license: null, checkedAt: new Date().toISOString().slice(0,10) };
    continue;
  }
  game.licenseAudit = { ...seen.get(`${repo.owner}/${repo.repo}`), checkedAt: new Date().toISOString().slice(0,10) };
}
await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
const counts = {};
for (const game of catalog.games) counts[game.licenseAudit.status] = (counts[game.licenseAudit.status] || 0) + 1;
console.log('License audit summary:', counts);
console.log('Review every entry marked no-license-declared, failed, not-found, or manual-review. Also verify game assets separately.');
