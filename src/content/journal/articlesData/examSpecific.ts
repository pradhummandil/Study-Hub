import type { Article } from '../articles';

export const EXAM_SPECIFIC_ARTICLES: Article[] = [
  {
    id: 'exam-jee-main-pyq-prioritization',
    slug: 'how-to-use-jee-main-pyqs-to-boost-your-percentile',
    title: 'How to Use JEE Main PYQs to Boost Your Percentile by 30 Points',
    excerpt: 'Strategic prioritization of 2021–2025 shift papers, high-yield chapter mapping, and numerical section accuracy drills.',
    category: 'Exam Strategy',
    subcategory: 'JEE Main',
    exam: 'JEE Main',
    contentType: 'exam_strategy',
    verified: true,
    status: 'published',
    editorPick: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 06, 2026',
    readTime: '7 min read',
    tags: ['JEE Main', 'Percentile Booster', 'Shift Papers', 'Chemistry', 'Physics', 'Mathematics'],
    sourceNames: ['Official NTA Shift Paper Archives'],
    sourceUrls: ['https://jeemain.nta.nic.in'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'Focus primarily on recent 2021–2025 NTA shift papers due to changing pattern weightage.',
      'Treat Chemistry as your percentile speed engine (aim to complete in 35–40 minutes).',
      'Select numerical response questions carefully based on low calculation risk.',
      'Audit formulas across Physics formula sheets daily.',
    ],
    cta: {
      title: 'Practice JEE Main PYQs by Shift',
      description: 'Solve real NTA JEE Main shift questions with subject-wise analytics.',
      buttonText: 'Solve JEE Main PYQs',
      link: '/practice',
    },
    content: `
# How to Use JEE Main PYQs to Boost Your Percentile by 30 Points

### Category: Exam Strategy (JEE Main Hub)

With NTA conducting JEE Main across multiple shifts each year, the database of official questions is massive. Between 2021 and 2025 alone, over 100 shift papers have been administered.

This volume is a massive advantage for candidates who know how to prioritize.

Here is the exact strategy for using JEE Main PYQs to maximize your percentile score:

---

## 1. Focus Exclusively on Recent 2021–2025 Shift Papers
Question patterns prior to 2020 were designed by different paper-setting committees. NTA’s current question bank relies heavily on:
- Direct formula-based questions in Physics (Kinematics, Modern Physics, Semiconductor Devices).
- NCERT line-by-line facts in Inorganic & Organic Chemistry.
- Multi-step algebraic and calculus numericals in Mathematics.

---

## 2. Subject Pacing Strategy for Maximum Score

\`\`\`
+------------------+-------------------+--------------------+
|  SUBJECT         |  TARGET TIME      |  TARGET ACCURACY   |
+------------------+-------------------+--------------------+
|  Chemistry       |  35–40 Minutes    |  85%+              |
|  Physics         |  50–55 Minutes    |  80%+              |
|  Mathematics     |  75–80 Minutes    |  75%+              |
+------------------+-------------------+--------------------+
\`\`\`

By completing Chemistry in 35 minutes, you unlock an extra 20 minutes to tackle time-heavy Mathematics questions without feeling rushed.

---

## 3. Numerical Response Selection Rule
In Section B (Numerical Value Questions), you are often given choice options. 

- **Rule:** Never pick a question involving heavy 3-digit multiplication or nested integration if an easier direct formula question is available. Calculate carefully—numerical response questions have zero partial credit!
`,
  },
  {
    id: 'exam-10-minute-guide-to-gate-computer-networks',
    slug: '10-minute-guide-to-gate-computer-networks',
    title: '10-Minute Guide to GATE Computer Networks: Core Formulas & Traps',
    excerpt: 'A high-density crash guide covering IPv4 subnetting, sliding window protocols, TCP congestion control, and routing algorithms.',
    category: 'Study Notes',
    subcategory: '10-Minute Guides',
    exam: 'GATE',
    contentType: 'study_notes',
    verified: true,
    status: 'published',
    editorPick: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 09, 2026',
    readTime: '5 min read',
    tags: ['10-Minute Guide', 'GATE CS', 'Computer Networks', 'Subnetting', 'TCP/IP'],
    sourceNames: ['GATE CS Syllabus Standard'],
    sourceUrls: ['https://gate2026.iitg.ac.in'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'Master Stop-and-Wait, Go-Back-N, and Selective Repeat efficiency equations.',
      'Know the difference between CIDR host calculation and subnet boundary addresses.',
      'Review TCP Slow Start, Congestion Avoidance, and Fast Recovery threshold transitions.',
    ],
    cta: {
      title: 'Practice GATE Computer Networks Questions',
      description: 'Solve topic-wise CN PYQs with instant virtual calculator support.',
      buttonText: 'Practice CN Questions',
      link: '/practice',
    },
    content: `
# 10-Minute Guide to GATE Computer Networks

### Category: The 10-Minute Guide Series

Computer Networks (CN) carries 8 to 10 marks in GATE CS. Here is a ultra-dense summary of high-frequency formulas and recurring traps:

---

## 1. Flow Control Protocols & Efficiency

### Stop-and-Wait Protocol
- **Efficiency ($\eta$):** $\eta = \frac{T_t}{T_t + 2T_p} = \frac{1}{1 + 2a}$ where $a = \frac{T_p}{T_t} = \frac{\text{Propagation Delay}}{\text{Transmission Delay}}$.
- **Throughput:** $\text{Throughput} = \eta \times B = \frac{L}{T_t + 2T_p}$ (where $L$ is packet length, $B$ is bandwidth).

### Go-Back-N (GBN)
- **Sender Window Size ($W_s$):** $N$. Receiver Window Size ($W_r$): $1$.
- **Efficiency ($\eta$):** $\eta = \min\left(1, \frac{N}{1 + 2a}\right)$.
- **Minimum Sequence Numbers Required:** $N + 1$ (requires $\lceil \log_2(N + 1) \rceil$ bits).

### Selective Repeat (SR)
- **Sender Window Size ($W_s$):** $N$. Receiver Window Size ($W_r$): $N$.
- **Efficiency ($\eta$):** $\eta = \min\left(1, \frac{N}{1 + 2a}\right)$.
- **Minimum Sequence Numbers Required:** $2N$ (requires $\lceil \log_2(2N) \rceil$ bits).

---

## 2. IP Addressing & Subnetting Shortcuts
- **Classless Inter-Domain Routing (CIDR):** Address format \`a.b.c.d/x\`.
- **Host Bits:** $h = 32 - x$.
- **Total Addresses:** $2^h$. **Usable Host IP Count:** $2^h - 2$ (Subtracting Network Address and Directed Broadcast Address).

---

## 3. TCP Congestion Control States
1. **Slow Start Phase:** Congestion window ($cwnd$) grows exponentially ($cwnd = cwnd + 1$ per ACK, doubling every RTT).
2. **Threshold Hit ($cwnd = ssthresh$):** Enters **Congestion Avoidance**.
3. **Congestion Avoidance Phase:** $cwnd$ grows linearly ($+1$ MSS per RTT).
4. **Time Out Event:** Set $ssthresh = \lfloor cwnd / 2 \rfloor$, reset $cwnd = 1$ MSS, return to Slow Start.
`,
  },
  {
    id: 'exam-cuet-preparation-roadmap',
    slug: 'cuet-preparation-roadmap-domain-selection-and-ncert-strategy',
    title: 'CUET Preparation Roadmap: Subject Selection, NCERT Mapping & Mocks',
    excerpt: 'How to structure your domain subject preparation, balance Class 12 board exams, and maximize university admission scores.',
    category: 'Exam Strategy',
    subcategory: 'CUET',
    exam: 'CUET',
    contentType: 'exam_strategy',
    verified: true,
    status: 'published',
    editorPick: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Study Hub Editorial',
      role: 'Undergraduate Admissions Desk',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 02, 2026',
    readTime: '6 min read',
    tags: ['CUET', 'University Admission', 'Domain Subjects', 'NCERT Mapping'],
    sourceNames: ['Official NTA CUET Portal'],
    sourceUrls: ['https://cuet.samarth.ac.in'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'Map university course eligibility criteria carefully before finalizing domain subjects.',
      'Tackle Class 12 NCERT chapters thoroughly since CUET syllabus aligns strictly with Class 12.',
      'Practice speed-oriented MCQs to handle 45 questions in 45/60 minutes.',
    ],
    cta: {
      title: 'Explore Exam Simulator',
      description: 'Attempt timed simulated test papers designed for competitive entrance exams.',
      buttonText: 'Open Exam Simulator',
      link: '/exam-simulator',
    },
    content: `
# CUET Preparation Roadmap: Subject Selection & NCERT Mapping

### Category: Exam Strategy (CUET Hub)

The Common University Entrance Test (CUET) has transformed undergraduate admissions across premier central universities (including Delhi University, BHU, JNU, and Allahabad University).

Because CUET tests speed and NCERT conceptual accuracy, preparing for it requires a tailored approach.

---

## 1. Domain Selection Strategy
Before registering for subjects, open the target university eligibility handbook.

- **Delhi University BA (Hons) / B.Sc (Hons):** Requires specific domain combinations matching your Class 12 subjects plus Language Test.
- **Rule:** Do not pick domain subjects you did not study in Class 12 unless explicitly permitted by the target university.

---

## 2. Syllabus Alignment: 100% Class 12 NCERT
Unlike JEE or NEET which test both Class 11 and Class 12, **CUET syllabus is strictly based on Class 12 NCERT curriculum**.

This means every line, exercise question, and marginal box in your Class 12 NCERT textbooks is high-yield exam material.

---

## 3. Speed & Accuracy Practice
CUET gives you 45 minutes for 40 questions (or 60 minutes for subjects involving numericals like Physics, Accountancy, Math).

To maintain speed:
- Practice solving MCQs without rough sheet clutter.
- Take 10 timed mock tests to eliminate hesitation on straightforward recall questions.
`,
  },
];
