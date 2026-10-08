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
      'A broad look at your health from a single blood sample: heart and cholesterol, blood count, metabolism, liver and kidney function, thyroid, hormones, inflammation, vitamins and minerals, cancer screening markers, cognitive markers, and autoimmune and genetic risk.',
    inclusions: [
      { icon: 'flask-conical', text: '300+ biomarkers in 11 groups' },
      { icon: 'droplets', text: 'Your sample taken by a trained phlebotomist' },
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
      'A broad look at your health from a single blood sample, organised into 27 areas, from female hormones and heart health to stress, nutrition and tumour markers. A private GP consultation and a 6-month repeat test are included.',
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
  { icon: 'utensils-crossed', title: 'Fast for 8–12 hours', text: 'Aim for at least 8 hours without food, ideally 10–12. Water is fine, and encouraged. A morning appointment after an overnight fast is the simplest way to do it.' },
  { icon: 'glass-water', title: 'Drink plenty of water', text: 'Keep well hydrated in the 24 hours before, and on the morning itself. It makes the blood draw more comfortable and helps some markers read accurately.' },
  { icon: 'pill', title: 'Carry on with medication', text: 'Take your prescribed medication as usual unless your doctor has told you otherwise. If you can, take vitamins and supplements after your blood draw.' },
  { icon: 'dumbbell', title: 'Go easy on exercise', text: 'Skip intense workouts for 24 hours beforehand. Hard exercise can temporarily raise inflammatory markers, creatine kinase and certain enzymes.' },
];

export const STEPS = [
  { icon: 'calendar-days', title: 'Tell us what you’d like', text: 'Send a short enquiry with your test, clinic and preferred date. We’ll reply by email to confirm.' },
  { icon: 'hospital', title: 'Visit the clinic', text: 'A trained phlebotomist takes your sample. The appointment lasts about 15 minutes.' },
  { icon: 'microscope', title: 'We analyse your sample', text: 'Your blood is analysed in the laboratory on automated platforms.' },
  { icon: 'file-text', title: 'Read your report', text: 'A specialist-reviewed report arrives by email in 2–5 working days (4 for the Women’s Health Check).' },
];

export const FAQS = [
  { q: 'Is sending an enquiry the same as booking?', a: 'Not quite. An enquiry is a request. Your appointment is confirmed once we reply by email with your clinic and time.' },
  { q: 'Do I need a GP referral?', a: 'No. You can get in touch with us directly.' },
  { q: 'How should I prepare?', a: 'Most people fast for 8–12 hours (water is fine), drink plenty of water, carry on with prescribed medication and avoid hard exercise for 24 hours beforehand. If you have a health condition or you’re unsure, just ask us before your appointment.' },
  { q: 'How long do results take?', a: 'Usually 2–5 working days from the moment your sample reaches the laboratory, and 4 working days for the Women’s Health Check. An express service may return results in as little as 2 hours; ask us about availability.' },
  { q: 'Can I share my results with my GP?', a: 'Of course. Your digital report can be shared with your GP or any other healthcare provider.' },
  { q: 'What does the £995 include?', a: 'The blood draw, laboratory analysis, a clinical specialist’s review and your digital report. The Women’s Health Check also includes a private GP consultation and a 6-month repeat test.' },
];
