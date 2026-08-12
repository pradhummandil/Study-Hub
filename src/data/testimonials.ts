export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  result?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Aryan M.',
    role: 'JEE Aspirant',
    result: 'Cleared JEE Advanced, AIR 4,200',
    quote: 'I was drowning in notes, watching lectures on 2x speed and retaining nothing. One call gave me a 6-week plan. I actually finished a full subject for the first time.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Priya K.',
    role: 'College Student (3rd Year)',
    result: 'Built a 3-hour daily study habit',
    quote: "I thought I just had bad discipline. Turns out my schedule was built for a robot, not a human. The advice was super practical and didn't feel preachy.",
    rating: 5,
  },
  {
    id: 't3',
    name: 'Rohan S.',
    role: 'UPSC Aspirant',
    result: 'Cleared Prelims GS Paper I',
    quote: 'Having someone audit my weekly plan every fortnight kept me accountable when I wanted to quit. No fancy gimmicks, just honest feedback.',
    rating: 5,
  },
  {
    id: 't4',
    name: 'Sneha P.',
    role: 'GATE CSE Candidate',
    result: 'Scored 740+ GATE Score',
    quote: 'I spent 4 months studying without solving PYQs out of fear. The guidance forced me to face my weak spots early, which made all the difference.',
    rating: 5,
  },
  {
    id: 't5',
    name: 'Vikram T.',
    role: 'Working Professional & Self-Learner',
    result: 'Balanced 20h/week prep alongside a full-time job',
    quote: 'Balancing a job with exam prep felt impossible. Mapping out micro-study windows gave me 2 hours every single morning before work.',
    rating: 5,
  },
  {
    id: 't6',
    name: 'Ananya D.',
    role: 'Pre-Med Student',
    result: 'Consistent 80%+ scores on mock tests',
    quote: 'The active recall template in the Studio library changed how I revise Biology. I stopped re-reading textbook chapters and actually started remembering.',
    rating: 5,
  },
];
