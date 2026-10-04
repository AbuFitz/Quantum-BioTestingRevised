// Single source for facts that appear on more than one page.
export const SITE = {
  name: 'Quantum BioTesting',
  legalName: 'Quantum BioTesting Ltd',
  tagline: 'Private blood tests for men and women in the UK',
  // Client-supplied pricing. Keep these as the only place the figures are written.
  price: 995,
  rrp: 2112,
  updated: '4 October 2026',
} as const;

export const money = (n: number) => `£${n.toLocaleString('en-GB')}`;
export const PRICE = money(SITE.price);
export const RRP = money(SITE.rrp);

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/tests/', label: 'Tests' },
  { href: '/how-it-works/', label: 'How it works' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const ENQUIRE_LABEL = 'Enquire';
