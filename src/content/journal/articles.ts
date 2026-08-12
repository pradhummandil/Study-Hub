export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Study Strategy' | 'Competitive Exams' | 'College' | 'Technology' | 'AI & Learning' | 'Productivity';
  image: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'how-to-build-a-gate-study-plan',
    title: 'How to Build a GATE Study Plan That Actually Holds Up Under Pressure',
    excerpt: 'Most GATE study schedules collapse by week 3 because they are built for ideal days. Here is the exact 4-phase framework used by top rankers.',
    category: 'Competitive Exams',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 10, 2026',
    readTime: '6 min read',
    featured: true,
    tags: ['GATE', 'Study Strategy', 'Time Management'],
    content: `
# How to Build a GATE Study Plan That Actually Holds Up Under Pressure

If you ask ten GATE aspirants how they plan their prep, eight of them will show you a hyper-rigid timetable: 6:00 AM to 8:00 AM Mathematics, 8:30 AM to 11:00 AM Data Structures, and so on.

By Wednesday evening, life happens. A college assignment deadline gets pulled forward, or a 2-hour topic takes 4 hours. The schedule breaks, guilt sets in, and by Sunday the entire plan is abandoned.

Here is the truth: **Rigid timetables fail because they assume zero friction.**

In this guide, we unpack the flexible 4-phase framework designed for realistic student routines.

---

## Phase 1: Syllabus Auditing (Not Just Chapter Counting)

Before opening your first notebook, divide your target exam syllabus into three categories:

1. **High-Weightage Core (40% of marks):** Core engineering subjects that carry weight in almost every paper (e.g. Algorithms, Computer Networks, Operating Systems for CS).
2. **Scoring Fundamentals (20% of marks):** Engineering Mathematics and General Aptitude. Never defer these to the last month.
3. **Elective & Niche Topics:** High-effort, low-frequency topics that should only be tackled once core foundations are secure.

---

## Phase 2: The Two-Subject Rotation Rule

Studying a single subject for three weeks straight causes severe memory decay in everything else. Conversely, switching between six subjects in a single day creates cognitive overload.

The sweet spot is **Two Active Subjects at a time**:
- **Primary Subject (60% time):** A heavy technical core subject.
- **Secondary Subject (40% time):** Mathematics or General Aptitude.

Rotate one subject out only when you complete its chapter-wise PYQ baseline.

---

## Phase 3: The 45-15 Active Recall Method

Passive reading produces an illusion of competence. High scores require **active retrieval**.

Structure every 60-minute study block like this:
- **45 Minutes:** Solve unsolved PYQs or write key derivations from memory.
- **15 Minutes:** Immediately audit your mistakes in your **Mistakes Notebook**.

---

## Phase 4: Weekly Buffer Blocks

Always leave **Sunday afternoon completely empty** as a dedicated Buffer Block. Use this window to:
- Catch up on delayed topics without breaking the weekly schedule.
- Complete one 30-minute timed PYQ drill.
- Review your spaced revision queue.

> "A plan that accounts for failure is the only plan that survives."
`,
  },
  {
    slug: 'why-active-recall-beats-passive-reading',
    title: 'Why Active Recall Beats Passive Reading (And How to Apply It Today)',
    excerpt: 'Re-reading highlighted notes gives a false sense of mastery. Cognitive science proves that retrieving information creates durable neural pathways.',
    category: 'Study Strategy',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 04, 2026',
    readTime: '5 min read',
    tags: ['Active Recall', 'Cognitive Psychology', 'Revision'],
    content: `
# Why Active Recall Beats Passive Reading

Have you ever re-read a chapter three times, highlighted half the page in yellow, and still felt completely lost when faced with an exam question?

This phenomenon is known as the **Illusion of Competence**. When your eyes scan familiar text, your brain recognizes it and mistakes recognition for mastery.

---

## What the Science Says

Cognitive psychologists call the process of forcing your brain to retrieve knowledge **Retrieval Practice** or **Active Recall**.

When you attempt to answer a question without looking at the answer:
1. Your memory pathways are forced to rebuild the connection.
2. Signal-to-noise ratio improves in your neural encoding.
3. Your brain identifies precise gaps in understanding instantly.

---

## How to Implement Active Recall Today

### 1. The Closed-Book Feynman Drill
After studying a concept (e.g. Dijkstra's Algorithm or TCP Handshake), close your notes completely. On a blank sheet of paper, write down:
- What problem does this solve?
- What are the step-by-step mechanics?
- What is the time complexity or edge case?

### 2. Flashcards with Spaced Repetition
Convert key definitions, formulas, and common pitfalls into digital flashcards. Review them on intervals (Day 1, Day 3, Day 7, Day 21).

### 3. Immediate PYQ Testing
Don't wait until you "feel ready" to solve PYQs. Solve 5 PYQs immediately after reading the core theory to lock in application.
`,
  },
  {
    slug: 'how-to-use-pyqs-properly',
    title: 'How to Use Previous Year Questions (PYQs) Properly from Day One',
    excerpt: 'Treating PYQs like a final mock test is the single biggest mistake students make. Here is how to turn past papers into a diagnostic learning engine.',
    category: 'Competitive Exams',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'July 28, 2026',
    readTime: '7 min read',
    tags: ['PYQ Practice', 'Exam Preparation', 'JEE', 'GATE'],
    content: `
# How to Use Previous Year Questions (PYQs) Properly

Most aspirants treat Previous Year Questions (PYQs) as a final test: they wait until they have completed 100% of the syllabus, then attempt 10 years of papers in the last month.

This approach deprives you of the single best diagnostic tool available during preparation.

---

## The Three Pass Strategy for PYQs

Instead of doing PYQs once at the end, run them through **Three Passes**:

### Pass 1: Concept Alignment (During First Read)
As soon as you finish a topic, solve 10–15 PYQs specific to that topic. The goal is not speed; it is understanding how examiners turn theoretical concepts into problem statements.

### Pass 2: Timed Topic Drills (2 Weeks Later)
Group questions by subject into 30-minute timed sets. Track your accuracy and time per question.

### Pass 3: Negative Marking Audit (1 Month Before Exam)
Review only the questions you got wrong or guessed correctly in previous attempts. Analyze why you fell for the trap option.
`,
  },
  {
    slug: 'managing-exam-anxiety-effectively',
    title: 'Managing Exam Anxiety: What Actually Works When Pressure Spikes',
    excerpt: 'Exam anxiety is not a personal failure—it is a physiological response. Learn empirical grounding techniques and cognitive restructuring.',
    category: 'Productivity',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'July 18, 2026',
    readTime: '5 min read',
    tags: ['Mental Health', 'Exam Focus', 'Productivity'],
    content: `
# Managing Exam Anxiety: Empirical Techniques

When the exam date approaches, your nervous system can interpret academic pressure as a physical threat. Heart rate spikes, focus scatters, and self-doubt sets in.

Here are actionable, scientifically backed strategies to regain composure:

1. **The 4-7-8 Breathing Protocol:** Inhale for 4 seconds, hold for 7, exhale for 8. This activates your parasympathetic nervous system within two minutes.
2. **De-catastrophizing:** Write down your worst-case outcome. Then write down three concrete steps you would take if it happened. Removing ambiguity reduces fear.
3. **Simulated Exam Conditions:** Exposure therapy works. Take mock tests at the exact same hour as your real exam to normalize the environment.
`,
  },
  {
    slug: 'building-a-resilient-study-routine',
    title: 'Building a Resilient Study Routine That Survives Burnout',
    excerpt: 'Motivation gets you started; habit systems keep you going. Discover how to structure low-energy study routines.',
    category: 'College',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'July 10, 2026',
    readTime: '6 min read',
    tags: ['Routine', 'Habits', 'Productivity'],
    content: `
# Building a Resilient Study Routine

A study routine that only works when you feel motivated, rested, and stress-free is fragile.

To build a routine that survives low-energy days:
- **Set a Minimum Viable Floor:** Define the bare minimum you will accomplish even on your worst day (e.g. 15 minutes of flashcards or 3 PYQs).
- **Protect Sleep Hygiene:** Quality sleep consolidates memory memory from short-term to long-term storage.
- **Track Weekly Inputs over Daily Spikes:** Measure total focused hours over 7 days rather than beating yourself up over a single off day.
`,
  },
  {
    slug: 'choosing-what-to-study-first',
    title: 'Choosing What to Study First When Everything Feels Urgent',
    excerpt: 'When faced with 10 chapters and 3 upcoming tests, decision paralysis strikes. Use the Eisenhower Impact Matrix for coursework.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'June 29, 2026',
    readTime: '4 min read',
    tags: ['Prioritization', 'Study Hacks', 'Productivity'],
    content: `
# Choosing What to Study First

Decision paralysis happens when everything on your to-do list feels equally urgent.

Use this simple priority rule:
1. **High Exam Weightage + Low Personal Mastery:** Priority 1 (Do first when energy is highest).
2. **High Exam Weightage + High Personal Mastery:** Priority 2 (Maintain with quick spaced revision).
3. **Low Exam Weightage + Low Personal Mastery:** Priority 3 (Tackle in short 30-minute sprint blocks).
4. **Low Exam Weightage + High Personal Mastery:** Priority 4 (Review only before exam week).
`,
  },
];
