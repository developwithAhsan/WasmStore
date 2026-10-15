import raw from '../data/games.json';

export type Game = {
  id: number; slug: string; name: string; category: string; demoUrl: string | null;
  repositoryUrl: string | null; status: string; description: string; tags: string[];
  controls: { desktop: string; mobile: string }; license: string; keywords: string[];
  sourceCatalog: string; attribution: string;
};

export const games = raw.games as Game[];
export const categories = [...new Set(games.map((game) => game.category))].sort();
export const tags = [...new Set(games.flatMap((game) => game.tags))].sort();
export const playableGames = games.filter((game) => game.demoUrl);
export const bySlug = (slug: string) => games.find((game) => game.slug === slug);
export const relatedGames = (game: Game, limit = 6) =>
  games.filter((candidate) => candidate.slug !== game.slug &&
    (candidate.category === game.category || candidate.tags.some((tag) => game.tags.includes(tag))))
    .slice(0, limit);

export function gameTitle(game: Game) {
  return game.keywords?.length ? game.keywords[0] : `${game.name} — Browser Game Listing`;
}
