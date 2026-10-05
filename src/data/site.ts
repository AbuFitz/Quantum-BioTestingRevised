// Single source for facts that appear on more than one page.
export const SITE = {
  name: 'Quantum BioTesting',
  legalName: 'Quantum BioTesting Ltd',
  tagline: 'Private blood tests for men and women in the UK',
  // Client-supplied pricing. Keep these as the only place the figures are written.
  price: 995,
  rrp: 2112,
  updated: '5 October 2026',
} as const;

export const money = (n: number) => `£${n.toLocaleString('en-GB')}`;
export const PRICE = money(SITE.price);
export const RRP = money(SITE.rrp);
// Derived from the client-supplied price and RRP; never typed by hand.
export const SAVING = money(SITE.rrp - SITE.price);

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/tests/', label: 'Tests' },
  { href: '/clinics/', label: 'Clinics' },
  { href: '/how-it-works/', label: 'How it works' },
] as const;

export const ENQUIRE_LABEL = 'Enquire';
