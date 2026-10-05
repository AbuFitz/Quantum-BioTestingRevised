// Structured-data helpers. Only facts that are on the visible page are emitted.
import { SITE } from './site';

export const breadcrumbLd = (site: URL, items: { name: string; path?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    ...(it.path ? { item: new URL(it.path, site).href } : {}),
  })),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const orgRef = (site: URL) => ({ '@type': 'Organization', name: SITE.name, url: site.href });
