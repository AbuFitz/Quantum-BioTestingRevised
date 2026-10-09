// Clinic locations. Addresses are carried over from the previous website and are PROVISIONAL:
// confirm each with the client before launch (see HANDOVER.md). No opening hours, phone numbers or
// coordinates are published because none have been supplied.
export type Clinic = {
  slug: string;
  name: string;
  city: 'London' | 'Birmingham';
  area: string;
  street: string;
  locality: string;
  postcode: string;
  where: string;
  mapQuery: string;
  // Position for the map pin, geocoded from the address with OpenStreetMap Nominatim. Confirm against the real clinic entrances.
  lat: number;
  lng: number;
};

export const CLINICS: Clinic[] = [
  { slug: 'fulham', name: 'Fulham', city: 'London', area: 'south-west London', street: '9–13 Fulham High Street', locality: 'London', postcode: 'SW6 3JH', where: 'on Fulham High Street in south-west London', mapQuery: '9-13 Fulham High Street, London SW6 3JH', lat: 51.4712, lng: -0.2109 },
  { slug: 'canary-wharf', name: 'Canary Wharf', city: 'London', area: 'east London', street: 'Street Level 0, Cabot Place', locality: 'Canary Wharf, London', postcode: 'E14 4QT', where: 'at street level in Cabot Place, Canary Wharf, in east London', mapQuery: 'Cabot Place, Canary Wharf, London E14 4QT', lat: 51.505, lng: -0.0212 },
  { slug: 'chiswick', name: 'Chiswick', city: 'London', area: 'west London', street: '149 Chiswick High Road', locality: 'London', postcode: 'W4 2DT', where: 'on Chiswick High Road in west London', mapQuery: '149 Chiswick High Road, London W4 2DT', lat: 51.4925, lng: -0.2552 },
  { slug: 'westfield-stratford', name: 'Westfield Stratford', city: 'London', area: 'east London', street: '122 The Street, Westfield Stratford City', locality: 'London', postcode: 'E20 1EN', where: 'inside Westfield Stratford City in east London', mapQuery: '122 The Street, Westfield Stratford City, London E20 1EN', lat: 51.5431, lng: -0.0064 },
  { slug: 'birmingham', name: 'Birmingham', city: 'Birmingham', area: 'Birmingham city centre', street: '39–40 High Street', locality: 'Birmingham, West Midlands', postcode: 'B4 7SL', where: 'on High Street in Birmingham city centre', mapQuery: '39-40 High Street, Birmingham B4 7SL', lat: 52.4792, lng: -1.8946 },
];

export const getClinic = (slug: string) => CLINICS.find((c) => c.slug === slug)!;
export const fullAddress = (c: Clinic) => `${c.street}, ${c.locality} ${c.postcode}`;
