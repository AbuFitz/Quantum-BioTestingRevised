import mensMarkers from './mens-markers.json';

export type Inclusion = { icon: string; text: string };

export type TestProduct = {
  key: 'mens' | 'womens';
  slug: string;
  name: string;
  short: string;
  biomarkers: string;
  summary: string;
  inclusions: Inclusion[];
  results: string;
};

export const TESTS: TestProduct[] = [
  {
    key: 'mens',
    slug: 'mens-health-check',
    name: 'Men’s Health Check',
    short: 'Men’s',
    biomarkers: '300+ biomarkers',
    summary:
      'A broad blood panel covering heart and cholesterol markers, blood count, metabolism, liver and kidney function, thyroid, hormones, inflammation, vitamins and minerals, cancer screening markers, cognitive markers, and autoimmune and genetic risk.',
    inclusions: [
      { icon: 'flask-conical', text: '300+ biomarkers in 11 groups' },
      { icon: 'droplets', text: 'Blood sample taken by a trained phlebotomist' },
      { icon: 'clipboard-check', text: 'Results reviewed by a clinical specialist' },
      { icon: 'file-text', text: 'Digital report with plain-English commentary' },
    ],
    results: '2–5 working days',
  },
  {
    key: 'womens',
    slug: 'womens-health-check',
    name: 'Women’s Health Check',
    short: 'Women’s',
    biomarkers: 'Up to 350 biomarkers',
    summary:
      'A broad blood panel organised into 27 health areas, from female hormones and heart health to stress, nutrition and tumour markers. A private GP consultation and a 6-month repeat test are included.',
    inclusions: [
      { icon: 'flask-conical', text: 'Up to 350 biomarkers in 27 health areas' },
      { icon: 'stethoscope', text: 'Private remote GP consultation included' },
      { icon: 'repeat', text: '6-month repeat test included' },
      { icon: 'file-text', text: 'Specialist-reviewed personalised report' },
    ],
    results: '4 working days',
  },
];

export const getTest = (key: string) => TESTS.find((t) => t.key === key)!;

export type MarkerGroup = { id: string; name: string; items: string[]; note?: string };

// Men’s Health Check marker list, carried over verbatim from the existing site's testing page.
// See HANDOVER.md: the list is unverified against laboratory documentation.
export const MENS_GROUPS: MarkerGroup[] = (mensMarkers as MarkerGroup[]).map((g) =>
  g.id === 'cancer'
    ? {
        ...g,
        note: 'Cancer screening markers are indicative only. Elevated markers need further clinical investigation and are not a diagnosis. Markers are applied appropriately for age and sex by the reviewing physician.',
      }
    : g,
);

// Women’s Health Check health areas, carried over verbatim from the existing site.
export const WOMENS_AREAS: string[] = [
  'Allergy Evaluation', 'Autoimmune', 'Bone Health', 'Diabetes Health', 'Digestive Health',
  'Epstein-Barr Virus', 'Female Hormone', 'Full Blood Count', 'Heart Health', 'Infection & Inflammation',
  'Iron Status', 'Kidney Health', 'Liver Health', 'Male Hormone', 'Metabolic Syndrome',
  'Muscle & Joint Health', 'Nutritional Health', 'Pancreatic Health', 'Personal Health Measurements',
  'Pituitary & Adrenal', 'Digestive & Bowel Health', 'Stress', 'Thyroid Health', 'Tumour Markers',
  'Urinalysis', 'UTI', 'Genetic Risk Assessment',
];

export const MENU_NOTE =
  'From time to time there may be temporary changes to the test menu. Please contact us to confirm availability for specific tests.';

export const PREPARATION = [
  { icon: 'utensils-crossed', title: 'Fast for 8–12 hours', text: 'Fast for at least 8 hours, ideally 10–12. Water is permitted and encouraged. A morning appointment after an overnight fast is simplest for most people.' },
  { icon: 'glass-water', title: 'Stay well hydrated', text: 'Drink plenty of water in the 24 hours before and on the morning of your test. It makes the blood draw more comfortable and improves the accuracy of certain markers.' },
  { icon: 'pill', title: 'Continue medications', text: 'Take prescribed medication as normal unless your doctor has advised otherwise. Where possible, take vitamin and mineral supplements after your blood draw.' },
  { icon: 'dumbbell', title: 'Avoid strenuous exercise', text: 'Avoid intense exercise for 24 hours beforehand. Heavy exercise can temporarily raise inflammatory markers, creatine kinase and certain enzymes.' },
];

export const CLINICS = [
  { name: 'Fulham', address: '9–13 Fulham High Street, London SW6 3JH' },
  { name: 'Canary Wharf', address: 'Street Level 0, Cabot Place, Canary Wharf E14 4QT' },
  { name: 'Chiswick', address: '149 Chiswick High Road, London W4 2DT' },
  { name: 'Westfield Stratford', address: '122 The Street, Westfield Stratford City, London E20 1EN' },
  { name: 'Birmingham', address: '39–40 High Street, Birmingham, West Midlands B4 7SL' },
];

export const STEPS = [
  { icon: 'calendar-days', title: 'Send an enquiry', text: 'Choose a test and a preferred clinic and date. The team replies by email to confirm the details.' },
  { icon: 'hospital', title: 'Attend the clinic', text: 'A trained phlebotomist takes your blood sample. The appointment takes about 15 minutes.' },
  { icon: 'microscope', title: 'Laboratory analysis', text: 'Your sample is analysed in the laboratory on automated platforms.' },
  { icon: 'file-text', title: 'Receive your report', text: 'A specialist-reviewed digital report arrives by email in 2–5 working days (4 for the Women’s Health Check).' },
];

export const FAQS = [
  { q: 'Is an enquiry the same as a booking?', a: 'No. Sending the form is a request. The appointment is confirmed only when the team replies by email to confirm your clinic and time.' },
  { q: 'Do I need a GP referral?', a: 'No. You can enquire directly without a GP referral.' },
  { q: 'How should I prepare?', a: 'Fast for 8–12 hours (water is fine), stay well hydrated, continue prescribed medication as normal and avoid strenuous exercise for 24 hours beforehand. If you have a health condition or are unsure, contact the team before your appointment.' },
  { q: 'How long do results take?', a: 'Standard results arrive in 2–5 working days from sample receipt at the laboratory, and in 4 working days for the Women’s Health Check. An express service may return results in as little as 2 hours; ask the team about availability.' },
  { q: 'Can I share my results with my GP?', a: 'Yes. The digital report can be shared with your GP or any other healthcare provider.' },
  { q: 'What does the price include?', a: 'Each test is £995. That covers the blood draw, laboratory analysis, clinical specialist review and your digital report. The Women’s Health Check also includes a private GP consultation and a 6-month repeat test.' },
];
