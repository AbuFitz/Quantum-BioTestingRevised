// Clinic and partner locations, supplied by the client on 2026-10-11 and geocoded by scripts/geocode-locations.mjs
// (OpenStreetMap Nominatim). Opening hours and notes appear only where the client gave them. No phone numbers are
// held. See HANDOVER.md for the entries that need the client's confirmation.
import raw from './locations.json';

export type Kind = 'clinic' | 'partner' | 'mobile' | 'hotel';
export type Clinic = {
  slug: string;
  name: string;
  venue?: string;
  kind: Kind;
  city: string;
  region: string;
  nation: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland' | 'Ireland';
  street: string;
  area?: string;
  locality: string;
  postcode?: string;
  hours?: string;
  notes?: string;
  lat: number;
  lng: number;
  approx?: boolean;
};

export const CLINICS = raw as Clinic[];
export const COUNT = CLINICS.length;

export const REGIONS = ['London', 'South East', 'South West', 'East of England', 'Midlands', 'North West', 'North East and Yorkshire', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland'] as const;
export const regionSlug = (r: string) => r.toLowerCase().replace(/[^a-z0-9]+/g, '-');
export const inRegion = (r: string) => CLINICS.filter((c) => c.region === r);

export const getClinic = (slug: string) => CLINICS.find((c) => c.slug === slug)!;
export const fullAddress = (c: Clinic) => [c.street, c.area && c.area !== c.locality ? c.area : '', c.locality, c.postcode].filter(Boolean).join(', ');
/** "Chelsea, London" for London sites; the town name elsewhere */
export const placeName = (c: Clinic) => (c.region === 'London' && !/london/i.test(c.name) ? `${c.name}, London` : c.name);
export const kindLabel = (c: Clinic) => ({ clinic: 'Clinic', partner: 'Partner site', mobile: 'Mobile clinic', hotel: 'Hotel health club' })[c.kind];
/** One short line for lists and popups: venue (if any) and area */
export const subtitle = (c: Clinic) => [c.venue, c.region === 'London' ? 'London' : c.city].filter(Boolean).join(' · ');
export const mapsQuery = (c: Clinic) => `${c.street}, ${c.locality}${c.postcode ? ' ' + c.postcode : ''}`;
