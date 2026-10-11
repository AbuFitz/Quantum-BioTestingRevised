// One-off tool: geocodes the client's location list with OpenStreetMap Nominatim (1 request per second, as the
// usage policy asks) and writes src/data/locations.json. Re-run only when the list changes:
//   node scripts/geocode-locations.mjs
// Review the "how" and "km" columns it prints: anything not matched by street address is marked approx.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

// Hand-checked positions where the automatic match was wrong or only approximate (scripts/location-overrides.json).
// `node scripts/geocode-locations.mjs --apply` re-applies them to the existing src/data/locations.json without any network calls.
const OVERRIDES = JSON.parse(readFileSync('scripts/location-overrides.json', 'utf8'));
if (process.argv.includes('--apply')) {
  const cur = JSON.parse(readFileSync('src/data/locations.json', 'utf8'));
  cur.forEach((c) => { const o = OVERRIDES[c.name]; if (o) { c.lat = o.lat; c.lng = o.lng; c.approx = o.approx; } });
  writeFileSync('src/data/locations.json', JSON.stringify(cur, null, 1) + '\n');
  console.log('applied', Object.keys(OVERRIDES).length, 'overrides to', cur.length, 'locations');
  process.exit(0);
}


// Supplied by the client on 2026-10-11. Text is kept as supplied (including apparent typos) and flagged in HANDOVER.md.
const L = (name, o) => ({ name, ...o });
const SRC = [
  // ---- England: London
  L('Chelsea', { city: 'London', region: 'London', nation: 'England', street: "346 King's Road", area: 'Chelsea', locality: 'London', postcode: 'SW3 5UR' }),
  L('Chiswick', { city: 'London', region: 'London', nation: 'England', street: '149 Chiswick High Road', area: 'Chiswick', locality: 'London', postcode: 'W4 2DT' }),
  L('Fulham', { city: 'London', region: 'London', nation: 'England', street: '9-13 Fulham High Street', area: 'Fulham', locality: 'London', postcode: 'SW6 3JH' }),
  L('Great Portland Street', { city: 'London', region: 'London', nation: 'England', street: '143-149 Great Portland Street', area: 'Fitzrovia', locality: 'London', postcode: 'W1W 6QN' }),
  L('Wimbledon', { city: 'London', region: 'London', nation: 'England', street: '27 High Street Wimbledon', area: 'Wimbledon', locality: 'London', postcode: 'SW19 5EE' }),
  L('Richmond', { city: 'London', region: 'London', nation: 'England', street: '15 The Quadrant', area: 'Richmond', locality: 'Richmond', postcode: 'TW9 1BP' }),
  L('Kensington', { city: 'London', region: 'London', nation: 'England', street: '143 Kensington High Street', area: 'Kensington', locality: 'London', postcode: 'W8 6SU' }),
  L('St Pauls', { city: 'London', region: 'London', nation: 'England', street: '23-1 Paternoster Row', area: 'St Pauls', locality: 'London', postcode: 'EC4M 8AB' }),
  L('Westfield Stratford', { city: 'London', region: 'London', nation: 'England', street: 'Unit 2052A, Westfield Stratford City', area: 'Stratford', locality: 'London', postcode: 'E20 1EJ' }),
  L('Canary Wharf', { city: 'London', region: 'London', nation: 'England', street: 'Street Level 0, Cabot Place', area: 'Canary Wharf', locality: 'London', postcode: 'E14 4QT' }),
  L('Hampstead', { city: 'London', region: 'London', nation: 'England', street: '72 Hampstead High St', area: 'Hampstead', locality: 'London', postcode: 'NW3 1QP', hours: '09:00-17:00, alternating Monday-Friday and Tuesday-Saturday' }),
  L('Soho', { city: 'London', region: 'London', nation: 'England', venue: 'UNTIL', street: '111 Charing Cross Rd', area: 'Soho', locality: 'London', postcode: 'WC2H 0DT' }),
  L('Liverpool Street', { city: 'London', region: 'London', nation: 'England', venue: 'UNTIL', street: '280 Bishops Square', area: 'Liverpool Street', locality: 'London', postcode: 'EC2M 4RB' }),
  // ---- England: elsewhere
  L('Royal Tunbridge Wells', { city: 'Royal Tunbridge Wells', region: 'South East', nation: 'England', street: '77 Mount Pleasant', locality: 'Tunbridge Wells', postcode: 'TN1 1PX' }),
  L('Chichester', { city: 'Chichester', region: 'South East', nation: 'England', venue: 'The Goodwood Health Club, The Goodwood Hotel', kind: 'hotel', street: 'The Goodwood Hotel', locality: 'Chichester', postcode: 'PO18 0QB' }),
  L('Brighton', { city: 'Brighton', region: 'South East', nation: 'England', venue: 'Mobile clinic', kind: 'mobile', street: '10 Fleet Street', locality: 'Brighton and Hove, Brighton', postcode: 'BN1 4ZE' }),
  L('Brighton seafront', { city: 'Brighton', region: 'South East', nation: 'England', venue: 'Leonardo Royal Hotel (mobile clinic)', kind: 'mobile', street: '6 Kings Road', locality: 'Brighton', postcode: 'BN1 2GS' }),
  L('Southampton', { city: 'Southampton', region: 'South East', nation: 'England', venue: 'Holland & Barrett', street: '48-50 Above Bar St', locality: 'Southampton', postcode: 'SO14 7GW' }),
  L('Winchester', { city: 'Winchester', region: 'South East', nation: 'England', venue: 'Holland & Barrett', street: '16 High Street', locality: 'Winchester', postcode: 'SO23 9JX', hours: '08:30-16:30, alternating Monday-Friday and Tuesday-Saturday' }),
  L('Oxford', { city: 'Oxford', region: 'South East', nation: 'England', venue: 'Holland & Barrett', street: '35 Queen Street', locality: 'Oxford', postcode: 'OX1 1ER', hours: '09:00-17:00, alternating Monday-Friday and Tuesday-Saturday' }),
  L('High Wycombe', { city: 'High Wycombe', region: 'South East', nation: 'England', venue: 'John Lewis', street: 'Holmers Farm Way, Cressex Centre', locality: 'High Wycombe', postcode: 'HP12 4N2', notes: 'Ground floor next to menswear.' }),
  L('Bluewater', { city: 'Greenhithe', region: 'South East', nation: 'England', venue: 'John Lewis', street: 'Bluewater Shopping Centre', locality: 'Greenhithe, Kent', postcode: 'DA9 9SA', notes: 'First floor, right side of the escalators between ladieswear and Beauty, right side of the building.' }),
  L('Exeter', { city: 'Exeter', region: 'South West', nation: 'England', venue: 'HAUS of DRA (mobile clinic)', kind: 'mobile', street: 'HAUS of DRA, Redhayes', locality: 'Exeter', postcode: 'EX5 2AN' }),
  L('Bournemouth', { city: 'Bournemouth', region: 'South West', nation: 'England', venue: 'Holland & Barrett', street: 'Castlepoint Shopping Centre, Unit 20, Castle Lane W', locality: 'Bournemouth' }),
  L('Bristol', { city: 'Bristol', region: 'South West', nation: 'England', venue: 'Holland & Barrett', street: 'Bristol Cabot Circus, George White Street SU59', locality: 'Bristol', postcode: 'BS1 3BA' }),
  L('Cheltenham', { city: 'Cheltenham', region: 'South West', nation: 'England', venue: 'John Lewis', street: '123 High Street', locality: 'Cheltenham', postcode: 'GL50 1DQ' }),
  L('Cambridge', { city: 'Cambridge', region: 'East of England', nation: 'England', venue: 'Floatwell (mobile clinic)', kind: 'mobile', street: '6 Salisbury Villas', locality: 'Cambridge', postcode: 'CB1 2JF' }),
  L('Norwich', { city: 'Norwich', region: 'East of England', nation: 'England', venue: 'Holland & Barrett', street: '19/21 White Lion Street', locality: 'Norwich', postcode: 'NR2 1QA' }),
  L('Birmingham', { city: 'Birmingham', region: 'Midlands', nation: 'England', street: '39-40 High Street', locality: 'Birmingham, West Midlands', postcode: 'B4 7SL' }),
  L('Nottingham', { city: 'Nottingham', region: 'Midlands', nation: 'England', venue: 'Holland & Barrett', street: '8-10 Clumber St', locality: 'Nottingham', postcode: 'NG1 3GA' }),
  L('Leicester', { city: 'Leicester', region: 'Midlands', nation: 'England', venue: 'Holland & Barrett', street: 'The Highcross Centre, Unit 43, High Street', locality: 'Leicester', hint: 'Highcross Leicester' }),
  L('Liverpool', { city: 'Liverpool', region: 'North West', nation: 'England', street: '25-25 Tithebarn Street, Exchange Station', locality: 'Liverpool', postcode: 'L2 2QP' }),
  L('Preston', { city: 'Preston', region: 'North West', nation: 'England', venue: 'Holland & Barrett', street: '49 Fishergate', locality: 'Preston', postcode: 'PR1 8BH' }),
  L('Wigan', { city: 'Wigan', region: 'North West', nation: 'England', venue: 'Holland & Barrett', street: 'Crompton Street, Unit 7A, Grand Arcade', locality: 'Wigan', postcode: 'WN1 1BH' }),
  L('Manchester', { city: 'Manchester', region: 'North West', nation: 'England', venue: 'Holland & Barrett', street: '103-105 Market Street', locality: 'Manchester', postcode: 'M1 1NN' }),
  L('Chester', { city: 'Chester', region: 'North West', nation: 'England', venue: 'Holland & Barrett, Broughton Shopping Park', street: 'Unit 12a, Broughton Shopping Park, Chester Road', area: 'Bretton', locality: 'Chester', hint: 'Broughton Shopping Park' }),
  L('Cheadle', { city: 'Cheadle', region: 'North West', nation: 'England', venue: 'John Lewis', street: 'Cheadle Royal Business Park, Wilmslow Rd', locality: 'Cheadle', hint: 'John Lewis Cheadle Royal', hours: '09:00-17:00, alternating Monday-Friday and Tuesday-Saturday' }),
  L('Newcastle upon Tyne', { city: 'Newcastle upon Tyne', region: 'North East and Yorkshire', nation: 'England', venue: 'John Lewis', street: 'Ground Floor, Eldon Square, Percy St', locality: 'Newcastle upon Tyne', hint: 'Eldon Square Newcastle' }),
  L('York', { city: 'York', region: 'North East and Yorkshire', nation: 'England', venue: 'Holland & Barrett', street: 'Monks Cross Drive, Huntington', locality: 'York', postcode: 'YO32 9GX' }),
  L('Sheffield', { city: 'Sheffield', region: 'North East and Yorkshire', nation: 'England', venue: 'Holland & Barrett, Meadowhall', street: '3 Meadowhall Way, Meadowhall', locality: 'Sheffield', postcode: 'S9 1EH' }),
  L('Hull', { city: 'Hull', region: 'North East and Yorkshire', nation: 'England', venue: 'Holland & Barrett', street: 'Grand Buildings, 7 Jameson St', area: 'Hull City Centre', locality: 'Hull', hint: 'Jameson Street Hull' }),
  L('Leeds', { city: 'Leeds', region: 'North East and Yorkshire', nation: 'England', street: 'Unit 10, Cross Arcade, Victoria Quarter', locality: 'Leeds', hint: 'Victoria Quarter Leeds' }),
  // ---- Scotland, Wales
  L('Edinburgh', { city: 'Edinburgh', region: 'Scotland', nation: 'Scotland', venue: 'Randox Edinburgh City Centre', street: '10 Frederick Street', locality: 'Edinburgh', postcode: 'EH2 2HB' }),
  L('Glasgow', { city: 'Glasgow', region: 'Scotland', nation: 'Scotland', venue: 'Randox Glasgow City Centre', street: '150 Howard Street', locality: 'Glasgow', postcode: 'G1 4ET' }),
  L('Dundee', { city: 'Dundee', region: 'Scotland', nation: 'Scotland', venue: 'Malmaison Hotel (mobile clinic)', kind: 'mobile', street: '44 Whitehall Crescent', locality: 'Dundee', postcode: 'DD1 4AY' }),
  L('Aberdeen', { city: 'Aberdeen', region: 'Scotland', nation: 'Scotland', venue: 'Aberdeen Sports Village', street: 'Linksfield Rd', locality: 'Aberdeen', postcode: 'AB24 5RU' }),
  L('Cardiff', { city: 'Cardiff', region: 'Wales', nation: 'Wales', venue: 'Holland & Barrett', street: 'Unit 4, 53-57 Queen Street', locality: 'Cardiff', postcode: 'CF10 2AS' }),
  // ---- Northern Ireland
  L('Belfast', { city: 'Belfast', region: 'Northern Ireland', nation: 'Northern Ireland', street: 'Unit 3, 711-713 Lisburn Road', locality: 'Belfast, County Antrim', postcode: 'BT9 7GU' }),
  L('Crumlin', { city: 'Crumlin', region: 'Northern Ireland', nation: 'Northern Ireland', street: '15 Mill Road', locality: 'Crumlin, County Antrim', postcode: 'BT29 4XL' }),
  L('Holywood', { city: 'Holywood', region: 'Northern Ireland', nation: 'Northern Ireland', street: '2 Redburn Square', locality: 'Holywood, County Down', postcode: 'BT18 9HZ' }),
  L('Derry/Londonderry', { city: 'Londonderry', region: 'Northern Ireland', nation: 'Northern Ireland', street: '100 Strand Road', locality: 'Londonderry, County Londonderry', postcode: 'BT48 7NR' }),
  L('Coleraine', { city: 'Coleraine', region: 'Northern Ireland', nation: 'Northern Ireland', venue: 'The Lodge Hotel (mobile clinic)', kind: 'mobile', street: 'Lodge Road', locality: 'Coleraine', postcode: 'BT52 1NF' }),
  L('Newry', { city: 'Newry', region: 'Northern Ireland', nation: 'Northern Ireland', street: '67 Hill Street', locality: 'Newry', postcode: 'BT34 1DG' }),
  // ---- Republic of Ireland
  L('Dublin Sandyford', { city: 'Dublin', region: 'Republic of Ireland', nation: 'Ireland', venue: 'Randox Health', street: 'Unit D & E Time Place, Corrig Road', area: 'Sandyford', locality: 'Dublin 18', postcode: 'D18R89T', notes: 'Access directions via what3words: deck.mostly.milky' }),
  L('Dublin Liffey Valley', { city: 'Dublin', region: 'Republic of Ireland', nation: 'Ireland', venue: 'Holland & Barrett, Liffey Valley Shopping Centre', street: 'Unit 55, Liffey Valley Shopping Centre, Fonthill Rd', locality: 'Clondalkin, Dublin', hint: 'Liffey Valley Shopping Centre' }),
  L('Dublin Henry Street', { city: 'Dublin', region: 'Republic of Ireland', nation: 'Ireland', venue: 'Holland & Barrett', street: '45 Henry St, North City', locality: 'Dublin 1', postcode: 'D01 E9X8' }),
  L('Dublin Airport', { city: 'Dublin', region: 'Republic of Ireland', nation: 'Ireland', venue: 'Clayton', street: 'Stockhole Lane, Clonshagh', locality: 'Swords, Co. Dublin', postcode: 'K67 X3H5' }),
  L('Galway', { city: 'Galway', region: 'Republic of Ireland', nation: 'Ireland', venue: 'Holland & Barrett', street: '3, 5 William St', locality: 'Galway', postcode: 'H91 Y9H3' }),
  L('Cork', { city: 'Cork', region: 'Republic of Ireland', nation: 'Ireland', venue: 'Holland & Barrett', street: '43-44 St Patricks Street', locality: 'Cork', postcode: 'T12 FY05' }),
];

const COUNTRY = { England: 'gb', Scotland: 'gb', Wales: 'gb', 'Northern Ireland': 'gb', Ireland: 'ie' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ask = (q, cc) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=${cc}&q=${encodeURIComponent(q)}`;
  try { const out = execFileSync('curl', ['-s', '-m', '25', '-A', 'QuantumBioTestingSite/1.0 (one-off geocode for clinic map)', url], { maxBuffer: 2e6 }).toString(); const j = JSON.parse(out); return j[0] ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5), what: j[0].display_name.slice(0, 70) } : null; } catch { return null; }
};
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const km = (a, b) => { const R = 6371, d = Math.PI / 180, x = (b.lng - a.lng) * d * Math.cos(((a.lat + b.lat) / 2) * d), y = (b.lat - a.lat) * d; return Math.round(R * Math.hypot(x, y) * 10) / 10; };

const out = [];
for (const c of SRC) {
  const cc = COUNTRY[c.nation];
  const tries = [
    ['street', [c.street, c.locality, c.postcode].filter(Boolean).join(', ')],
    ['venue', [c.venue, c.street, c.locality].filter(Boolean).join(', ')],
    ['hint', c.hint ? c.hint : ''],
    ['postcode', c.postcode || ''],
    ['town', `${c.city}`],
  ].filter(([, q]) => q);
  let hit = null, how = '';
  const town = (await (async () => { const r = ask(c.city, cc); await sleep(1100); return r; })());
  for (const [h, q] of tries) { const r = ask(q, cc); await sleep(1100); if (r && (!town || km(r, town) < 40)) { hit = r; how = h; break; } }
  if (!hit && town) { hit = town; how = 'town'; }
  const slug = slugify(`${c.name}${c.venue && /Holland|John Lewis|UNTIL|Randox/.test(c.venue) ? '' : ''}`);
  out.push({ slug, ...c, kind: c.kind || (c.venue && /Holland|John Lewis|UNTIL|Randox|Clayton|Aberdeen Sports/.test(c.venue) ? 'partner' : 'clinic'), lat: hit?.lat, lng: hit?.lng, approx: how !== 'street' && how !== 'postcode' });
  console.log(c.name.padEnd(24), how.padEnd(9), hit ? `${hit.lat},${hit.lng}` : 'NONE', hit && town ? km(hit, town) + 'km from ' + c.city : '', '|', hit?.what || '');
}
out.forEach((c) => { const o = OVERRIDES[c.name]; if (o) { c.lat = o.lat; c.lng = o.lng; c.approx = o.approx; } });
const slugs = new Set(out.map((o) => o.slug));
if (slugs.size !== out.length) console.log('WARNING duplicate slugs');
writeFileSync('src/data/locations.json', JSON.stringify(out, null, 1) + '\n');
console.log('wrote', out.length);
