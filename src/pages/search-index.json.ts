import { games, categoryForGame } from '../lib/games';

export const GET = () => {
  const searchIndex = games.map((game) => ({
    name: game.name,
    slug: game.slug,
    category: categoryForGame(game).name,
    tags: game.tags ?? [],
    keywords: game.keywords ?? [],
    thumbnailUrl: game.thumbnailUrl ?? null
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
};
