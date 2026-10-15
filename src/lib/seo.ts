import site from '../data/site.json';

export function canonical(pathname: string) {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return new URL(clean, site.url).toString();
}
export function pageSchema(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: canonical(path),
    isPartOf: { '@type': 'WebSite', name: site.name, url: site.url }
  };
}
export function breadcrumbs(items: {name:string; path:string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: canonical(item.path)
    }))
  };
}
