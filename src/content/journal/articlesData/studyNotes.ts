import type { Article } from '../articles';

export const STUDY_NOTES_ARTICLES: Article[] = [
  {
    id: 'notes-how-to-make-one-page-revision-sheets',
    slug: 'how-to-make-one-page-revision-notes-that-actually-work',
    title: 'How to Make One-Page Revision Notes That Actually Work',
    excerpt: 'Compressing a 100-page chapter into a single sheet without losing critical formulas, edge cases, and mistake triggers.',
    category: 'Study Notes',
    subcategory: 'Revision Systems',
    contentType: 'study_notes',
    verified: true,
    status: 'published',
    editorPick: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 10, 2026',
    readTime: '6 min read',
    tags: ['Notes Worth Keeping', 'One-Page Notes', 'Revision', 'Cheat Sheets'],
    sourceNames: ['Study Hub Note Architecture Standard'],
    sourceUrls: ['https://studyhub.internal/standards/one-page-notes'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'One-page notes should be built after solving PYQs, not during your first textbook read.',
      'Divide the sheet into 4 distinct quadrants: Formulas, Boundary Conditions, Traps, and Key Derivations.',
      'Use ultra-concise trigger phrases instead of copying full paragraphs.',
      'Store sheets in clear sleeves organized by exam subject.',
    ],
    cta: {
      title: 'Create Digital Notes & Flashcards',
      description: 'Convert your one-page revision points into smart spaced repetition decks.',
      buttonText: 'Open Flashcards Hub',
      link: '/flashcards',
    },
    content: `
# How to Make One-Page Revision Notes That Actually Work

### Category: Notes Worth Keeping

When exam week arrives, opening 600-page standard textbooks is a recipe for cognitive overload. The goal of revision notes is to compress an entire chapter (e.g. Thermodynamics or Operating Systems) into **a single A4 sheet** that can be scanned in under 10 minutes.

However, most students create "one-page notes" by simply writing in micro-font, squeezing 5,000 words onto a single sheet. This creates visual clutter that is painful to read.

Here is the exact 4-quadrant layout for building high-yield one-page revision sheets:

---

## The 4-Quadrant Architecture

Take an A4 sheet in landscape orientation. Divide it into four clean quadrants:

\`\`\`
+-----------------------------------+-----------------------------------+
|  QUADRANT 1: CORE FORMULAS & UNITS |  QUADRANT 2: BOUNDARY CONDITIONS   |
|  - Dimensioned equations          |  - Assumptions (e.g. ideal gas)   |
|  - SI units and conversions       |  - Range of validity              |
+-----------------------------------+-----------------------------------+
|  QUADRANT 3: RECURRING TRAPS & PYQ |  QUADRANT 4: VISUAL GRAPH / MAP  |
|  - Common sign errors             |  - Micro P-V diagram / Flowchart  |
|  - Past mistake triggers          |  - Key curve slopes & intercepts  |
+-----------------------------------+-----------------------------------+
\`\`\`

---

## Rule 1: Build Sheets AFTER PYQs, Not Before

Never create a short revision sheet during your first read of a chapter. When a concept is new, everything feels important, leading to bloated notes.

Wait until you have solved at least 20 PYQs for that chapter. You will immediately recognize which 15% of the formulas carry 85% of the exam weightage.

---

## Rule 2: Use Trigger Keywords, Not Sentences

Instead of writing:
> *"The speed of light in a vacuum is independent of the motion of all observers or of the source of light."*

Write:
> **c = const** (Observer-independent)

Your brain only needs the trigger keyword to retrieve the full memory pathway if active recall was practiced earlier.

---

## Rule 3: Highlight Your Personal Mistakes in Red

If you personally lost marks in a mock test due to forgetting a factor of $1/2$ in kinetic energy calculations, write **"/2 !!"** in bold red ink in Quadrant 3. Personal error triggers are the most valuable content on the sheet.
`,
  },
  {
    id: 'notes-how-to-make-gate-short-notes',
    slug: 'how-to-make-gate-short-notes-that-save-months-of-revision',
    title: 'How to Make GATE Short Notes That Save Months of Revision',
    excerpt: 'Step-by-step formula map design for Computer Networks, DBMS, OS, Data Structures, and Engineering Mathematics.',
    category: 'Study Notes',
    subcategory: 'GATE',
    exam: 'GATE',
    contentType: 'study_notes',
    verified: true,
    status: 'published',
    editorPick: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 08, 2026',
    readTime: '7 min read',
    tags: ['GATE', 'Short Notes', 'Computer Science', 'Formula Sheets', 'Revision'],
    sourceNames: ['GATE Engineering Note Framework'],
    sourceUrls: ['https://studyhub.internal/gate/short-notes'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'Keep GATE short notes under 5 pages per subject.',
      'Include exact time/space complexities for algorithms.',
      'Summarize protocol header formats (IPv4, TCP, UDP) with bit fields.',
      'Review short notes during 30-minute daily morning slots.',
    ],
    cta: {
      title: 'Open GATE Revision Tools',
      description: 'Access formula maps, short notes, and practice drills for GATE CS & IT.',
      buttonText: 'Explore Revision Engine',
      link: '/revision',
    },
    content: `
# How to Make GATE Short Notes That Save Months of Revision

### Category: Notes Worth Keeping (GATE Engineering Edition)

GATE papers reward conceptual precision and mathematical speed. In the last 45 days before GATE, reviewing 10 full notebooks of 200 pages each is impossible. You need concise **Subject Short Notes (3–5 pages max per subject)**.

Here is how to structure short notes for core technical subjects:

---

## 1. Computer Networks Short Sheet
- **Header Diagrams:** Draw IPv4 (20 bytes min), TCP (20 bytes min), and UDP (8 bytes) headers with exact field bit sizes.
- **Sliding Window Formulas:**
  - Stop-and-Wait Efficiency: $\eta = \frac{1}{1 + 2a}$ where $a = \frac{T_p}{T_t}$.
  - Go-Back-N Efficiency: $\eta = \frac{N}{1 + 2a}$.
  - Selective Repeat Efficiency: Window size $W_s \le 2^{n-1}$.
- **Subnetting Shortcuts:** Micro-table of CIDR notation (/24 to /30) with usable IP counts.

---

## 2. DBMS Short Sheet
- **Normalization Checklist:**
  - 1NF: Atomic values.
  - 2NF: 1NF + No partial dependencies ($X \to A$ where $X$ is a proper subset of candidate key and $A$ is non-prime).
  - 3NF: 2NF + No transitive dependencies ($X \to A$ where $X$ is superkey or $A$ is prime).
  - BCNF: 3NF + For every $X \to A$, $X$ must be a superkey.
- **Transaction Properties (ACID):** Concurrency schedules (Conflict serializability algorithm using precedence graphs).

---

## 3. Operating Systems Short Sheet
- **CPU Scheduling:** Comparison table of FCFS, SJF, SRTF, Round Robin (Impact of Time Quantum), Priority.
- **Deadlock Conditions:** Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
- **Paging Formulas:**
  - Effective Access Time (EAT) $= \text{Hit ratio} \times (TLB + Mem) + (1 - \text{Hit ratio}) \times (TLB + 2 \times Mem)$.
  - Page Table Size $= \text{Number of entries} \times \text{Entry size}$.

---

## Maintenance & Usage
Read your short notes every morning for 20 minutes before starting new problem sets. By exam day, every formula position on the page will be burned into your visual memory.
`,
  },
  {
    id: 'notes-how-to-create-jee-mistake-notebook',
    slug: 'how-to-create-a-jee-advanced-mistake-notebook',
    title: 'How to Create a JEE Advanced Mistake Notebook (The Vault)',
    excerpt: 'Turning lost marks into future rank points by building a structured log of calculation slips, conceptual traps, and unforced errors.',
    category: 'Study Notes',
    subcategory: 'JEE Advanced',
    exam: 'JEE Advanced',
    contentType: 'study_notes',
    verified: true,
    status: 'published',
    editorPick: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'August 02, 2026',
    readTime: '6 min read',
    tags: ['JEE Advanced', 'Mistake Notebook', 'Error Vault', 'Mock Test Analysis'],
    sourceNames: ['Study Hub Mistake Vault System'],
    sourceUrls: ['https://studyhub.internal/systems/mistake-vault'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'A mistake notebook is the single highest-ROI document you will create during prep.',
      'Log the question stem, your wrong step, the correct solution, and the underlying lesson.',
      'Review your mistake vault 24 hours before taking every mock test.',
    ],
    cta: {
      title: 'Log Mistakes in Study Hub',
      description: 'Use the built-in Mistakes Vault to classify, tag, and re-solve missed questions.',
      buttonText: 'Open Mistakes Vault',
      link: '/mistakes',
    },
    content: `
# How to Create a JEE Advanced Mistake Notebook (The Vault)

### Category: Notes Worth Keeping

Most students analyze a test by checking the answer key, saying *"Ah, I made a silly mistake here,"* and closing the paper forever.

Three weeks later, in the next mock test, they make the exact same "silly mistake."

A **Mistake Notebook** (or Error Vault) breaks this cycle. It is a dedicated journal where every single lost mark is cataloged, analyzed, and transformed into a permanent learning lesson.

---

## Anatomy of a Mistake Entry

For every question you missed or guessed in a test, fill out four clean fields:

\`\`\`markdown
### ENTRY #42 — Rotational Motion (Mock Test #6)
- **Question Summary:** Cylinder rolling down an inclined plane with friction.
- **My Wrong Step:** Assumed friction force was static friction equal to $\mu N$ without checking pure rolling condition.
- **Correct Concept:** Friction in pure rolling is self-adjusting static friction $f \le \mu N$. Equate torque $\tau = I\alpha$ first.
- **Takeaway Rule:** Never substitute $f = \mu N$ automatically in rolling problems unless slipping is explicitly stated!
\`\`\`

---

## The 3-Color Highlighting System
- 🔴 **Red:** Fundamental concept gap (Requires re-reading chapter theory).
- 🟡 **Yellow:** Calculation slip or formula mis-remembered (Requires 10 drill questions).
- 🔵 **Blue:** Misread question stem or time management panic (Requires psychological pacing check).

---

## The Pre-Test Reading Ritual
Do not read full textbooks the night before a mock test. Read your **Mistake Notebook from cover to cover**.

Reminding your brain of your past 50 errors right before entering the exam room dramatically reduces unforced error rates during the actual test.
`,
  },
  {
    id: 'notes-neet-biology-one-page-recall-sheets',
    slug: 'building-neet-biology-one-page-recall-sheets',
    title: 'Building NEET Biology One-Page Recall Sheets for NCERT Mastery',
    excerpt: 'How to convert dense NCERT Biology chapters into visual diagram maps, flowcharts, and high-yield numerical charts.',
    category: 'Study Notes',
    subcategory: 'NEET',
    exam: 'NEET',
    contentType: 'study_notes',
    verified: true,
    status: 'published',
    editorPick: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Pradhum Mandil',
      role: 'Founder, Study Hub',
      avatar: '/images/pradhum-mandil.jpg',
    },
    publishedAt: 'July 29, 2026',
    readTime: '5 min read',
    tags: ['NEET', 'NCERT Biology', 'Revision Maps', 'Recall Sheets'],
    sourceNames: ['Study Hub Biology Recall Method'],
    sourceUrls: ['https://studyhub.internal/neet/biology-recall'],
    sourceCheckedAt: 'August 2026',
    keyTakeaways: [
      'Extract NCERT example lists (e.g. Plant Kingdom algae types) into tabular columns.',
      'Annotate NCERT diagrams with handwritten function callouts.',
      'Practice closed-book diagram drawing to build 360/360 confidence.',
    ],
    cta: {
      title: 'Practice Biology Spaced Flashcards',
      description: 'Test your NCERT Biology active recall with curated flashcard decks.',
      buttonText: 'Open Biology Flashcards',
      link: '/flashcards',
    },
    content: `
# Building NEET Biology One-Page Recall Sheets

### Category: Notes Worth Keeping (NEET Biology Edition)

NEET Biology consists of 38 chapters packed with scientific names, anatomical examples, physiological pathways, and ecological statistics. Trying to re-read both NCERT volumes in the final two weeks leads to severe memory confusion.

Here is how to create **Visual Recall Sheets** for complex NCERT Biology chapters:

---

## 1. The Example Table Method (Plant & Animal Kingdom)
Instead of continuous paragraph text, map examples into clean comparison grids:

| Phylum / Class | Key Feature | Examples (NCERT Specific) | Common Trap / Exception |
| :--- | :--- | :--- | :--- |
| **Chlorophyceae** | Chl a, b; Pyrenoids | *Volvox, Ulothrix, Spirogyra, Chlamydomonas* | Stored food is starch |
| **Phaeophyceae** | Chl a, c; Fucoxanthin | *Ectocarpus, Dictyota, Laminaria, Sargassum* | Stored food is mannitol/laminarin |
| **Rhodophyceae** | Chl a, d; r-phycoerythrin | *Polysiphonia, Porphyra, Gracilaria, Gelidium* | Flagella absent |

---

## 2. Physiological Flowcharting (Human Physiology)
Convert long text descriptions of pathways into compact flowcharts:

> **RAAS Pathway:** Low renal blood pressure $\to$ Juxtaglomerular cells release **Renin** $\to$ Converts Angiotensinogen to **Angiotensin I** $\to$ ACE converts to **Angiotensin II** $\to$ Vasoconstriction + Aldosterone release $\to$ $\text{Na}^+$ & Water reabsorption $\to$ Blood pressure restored.

---

## 3. Diagram Annotation Overlays
Photocopy un-labeled NCERT diagrams (e.g. Human Heart, Nephron, Embryo Sac). Keep a stack of 10 blank copies. Practice filling out all labels from memory in 60 seconds.
`,
  },
];
