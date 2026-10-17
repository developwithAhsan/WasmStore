import raw from '../data/games.json';

export type Game = {
  id: number; slug: string; name: string; category: string; demoUrl: string | null; thumbnailUrl?: string | null;
  repositoryUrl: string | null; status: string; description: string; tags: string[];
  controls: { desktop: string; mobile: string }; license: string; keywords: string[];
  sourceCatalog: string; attribution: string;
};

export const games = raw.games as Game[];
export const tags = [...new Set(games.flatMap((game) => game.tags))].sort();
export const playableGames = games.filter((game) => game.demoUrl);
export const bySlug = (slug: string) => games.find((game) => game.slug === slug);

export const arcadeCategories = [
  { key: 'cat-1', name: 'Classic Games', shortName: 'Classics', slug: 'classic-games', color: '#A78BFA', description: 'Legendary games and iconic browser ports.', sourceCategories: ['Other'] },
  { key: 'cat-2', name: 'Action & Adventure', shortName: 'Action', slug: 'action-adventure-games', color: '#EF4136', description: 'Big missions, brave heroes and worlds to explore.', sourceCategories: ['Action', 'Adventure'] },
  { key: 'cat-3', name: 'Arcade & Platform', shortName: 'Arcade', slug: 'arcade-platform-games', color: '#2EA8F0', description: 'Quick rounds, sharp jumps and high-score runs.', sourceCategories: ['Arcade', 'Platformer'] },
  { key: 'cat-4', name: 'Racing & Sports', shortName: 'Racing', slug: 'racing-sports-games', color: '#2ECC71', description: 'Race, compete and chase the next win.', sourceCategories: ['Racing', 'Sports'] },
  { key: 'cat-5', name: 'Puzzle & Strategy', shortName: 'Puzzle', slug: 'puzzle-strategy-games', color: '#FF6FB5', description: 'Think ahead, solve patterns and master every move.', sourceCategories: ['Puzzle', 'Strategy'] }
] as const;
export type ArcadeCategory = typeof arcadeCategories[number];
export const categoryForGame = (game: Pick<Game, 'category'>) =>
  arcadeCategories.find((category) => (category.sourceCategories as readonly string[]).includes(game.category)) ?? arcadeCategories[0];
export const gamesForCategory = (category: ArcadeCategory) =>
  games.filter((game) => (category.sourceCategories as readonly string[]).includes(game.category));
export const relatedGames = (game: Game, limit = 6) =>
  games.filter((candidate) => candidate.slug !== game.slug &&
    (candidate.category === game.category || candidate.tags.some((tag) => game.tags.includes(tag))))
    .slice(0, limit);
export function gameTitle(game: Game) {
  return game.keywords?.length ? game.keywords[0] : game.name + ' — Browser Game Listing';
}
