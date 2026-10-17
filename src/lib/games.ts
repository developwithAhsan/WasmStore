import raw from '../data/games.json';

export type Game = {
  id: number; slug: string; name: string; category: string; demoUrl: string | null; thumbnailUrl?: string | null;
  repositoryUrl: string | null; status: string; description: string; tags: string[];
  controls: { desktop: string; mobile: string }; license: string; keywords: string[];
  sourceCatalog: string; attribution: string;
};

export const games = raw.games as Game[];
export const tags = [...new Set(games.flatMap((game) => game.tags))].sort();
// Retain the source-catalog categories used by the existing /games and /categories archive routes.
export const categories: string[] = [...new Set(games.map((game) => game.category))].sort();
export const playableGames = games.filter((game) => game.demoUrl);
export const bySlug = (slug: string) => games.find((game) => game.slug === slug);

export const arcadeCategories = [
  { key: 'cat-1', name: 'PC Games', shortName: 'PC Games', slug: 'pc-games', color: '#A78BFA', description: 'Big-screen favourites, open worlds and PC-style game ports.', sourceCategories: [] },
  { key: 'cat-2', name: 'Classic Games', shortName: 'Classics', slug: 'classic-games', color: '#EF4136', description: 'Memorable favourites and timeless browser-game discoveries.', sourceCategories: ['Adventure', 'Other'] },
  { key: 'cat-3', name: 'Arcade & Racing', shortName: 'Arcade & Racing', slug: 'arcade-racing', color: '#2EA8F0', description: 'Fast races, arcade action and high-score challenges.', sourceCategories: ['Arcade', 'Platformer', 'Racing', 'Sports'] },
  { key: 'cat-4', name: 'Flash Games', shortName: 'Flash Games', slug: 'flash-games', color: '#2ECC71', description: 'Flash-era favourites and games inspired by the classic web.', sourceCategories: [] },
  { key: 'cat-5', name: 'Puzzle & Strategy', shortName: 'Puzzle & Strategy', slug: 'puzzle-strategy', color: '#FF6FB5', description: 'Solve puzzles, plan ahead and put your strategy to the test.', sourceCategories: ['Puzzle', 'Strategy'] }
] as const;
export type ArcadeCategory = typeof arcadeCategories[number];
const pcGameMatch = (game: Pick<Game, 'slug' | 'name'>) => {
  const title = (game.slug + ' ' + game.name).toLowerCase();
  return /gta-vice-city|gta-v\b|gta-3\b|chinatown|the-sims|\bsims\b|stardew-valley|minecraft/.test(title);
};
const flashGameMatch = (game: Pick<Game, 'slug' | 'name' | 'tags'>) =>
  /flash/.test((game.slug + ' ' + game.name + ' ' + game.tags.join(' ')).toLowerCase());
export const categoryForGame = (game: Pick<Game, 'category' | 'slug' | 'name' | 'tags'>) => {
  if (pcGameMatch(game)) return arcadeCategories[0];
  if (flashGameMatch(game)) return arcadeCategories[3];
  if (['Arcade', 'Platformer', 'Racing', 'Sports'].includes(game.category)) return arcadeCategories[2];
  if (['Puzzle', 'Strategy'].includes(game.category)) return arcadeCategories[4];
  return arcadeCategories[1];
};
export const gamesForCategory = (category: ArcadeCategory) =>
  games.filter((game) => categoryForGame(game).key === category.key);
export const relatedGames = (game: Game, limit = 6) =>
  games.filter((candidate) => candidate.slug !== game.slug &&
    (candidate.category === game.category || candidate.tags.some((tag) => game.tags.includes(tag))))
    .slice(0, limit);
export function gameTitle(game: Game) {
  return game.keywords?.length ? game.keywords[0] : game.name + ' — Browser Game Listing';
}
