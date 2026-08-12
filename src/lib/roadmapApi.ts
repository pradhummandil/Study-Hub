// src/lib/roadmapApi.ts
import { supabase } from './supabase';
import type { RoadmapData, RoadmapSection, RoadmapTopic, ExamCategory } from '../types/student-core';

const ROADMAP_PROGRESS_KEY = 'studyhub_user_roadmap_progress';

const GATE_CS_ROADMAP: RoadmapData = {
  id: 'gate-cs-2027',
  exam: 'GATE',
  title: 'GATE Computer Science 2027 Comprehensive Path',
  description: 'Master Foundations, Core CS Systems, Advanced Theory, and Exam PYQs/Mocks.',
  total_topics: 12,
  completed_topics: 2,
  overall_progress: 17,
  sections: [
    {
      id: 'sec-foundation',
      roadmap_id: 'gate-cs-2027',
      title: 'FOUNDATION',
      category: 'FOUNDATION',
      topics: [
        {
          id: 'programming',
          section_id: 'sec-foundation',
          subject: 'Programming',
          title: 'C Programming & Data Types',
          description: 'Pointers, Memory Allocation, Functions, Recursion, Pointers to Functions.',
          estimated_hours: 15,
          subtopics: ['Data Types & Control Flow', 'Pointers & Dynamic Memory', 'Arrays & Strings', 'Recursion & Stack Frames'],
          status: 'completed',
          progress_pct: 100,
        },
        {
          id: 'engg-maths',
          section_id: 'sec-foundation',
          subject: 'Engineering Mathematics',
          title: 'Discrete Mathematics & Linear Algebra',
          description: 'Propositional Logic, Sets, Relations, Graphs, Matrices & Eigenvalues.',
          estimated_hours: 25,
          subtopics: ['Mathematical Logic & Predicates', 'Combinatorics & Recurrence', 'Graph Theory', 'Linear Algebra & Eigenvalues', 'Probability & Statistics'],
          status: 'completed',
          progress_pct: 100,
        },
      ],
    },
    {
      id: 'sec-core',
      roadmap_id: 'gate-cs-2027',
      title: 'CORE CS SYSTEMS',
      category: 'CORE',
      topics: [
        {
          id: 'computer-networks',
          section_id: 'sec-core',
          subject: 'Computer Networks',
          title: 'Computer Networks & Protocols',
          description: 'OSI vs TCP/IP Layers, Data Link Control, IP Addressing, Subnetting, TCP Congestion Control, Routing Algorithms.',
          estimated_hours: 30,
          subtopics: ['Network Models & Physical Layer', 'Framing & Error Control', 'IP Addressing & Subnetting', 'Routing Protocols (RIP, OSPF, BGP)', 'TCP/UDP & Congestion Control', 'Application Layer Protocols (DNS, HTTP)'],
          status: 'in_progress',
          progress_pct: 64,
        },
        {
          id: 'operating-systems',
          section_id: 'sec-core',
          subject: 'Operating Systems',
          title: 'Operating Systems & Concurrency',
          description: 'Process Management, Threads, CPU Scheduling, Deadlocks, Memory Virtualization, File Systems.',
          estimated_hours: 28,
          subtopics: ['Processes & Threads', 'CPU Scheduling Algorithms', 'Process Synchronization & Semaphores', 'Deadlock Detection & Avoidance', 'Virtual Memory & Page Replacement', 'Disk Scheduling'],
          status: 'not_started',
          progress_pct: 0,
        },
        {
          id: 'dbms',
          section_id: 'sec-core',
          subject: 'DBMS',
          title: 'Database Management Systems',
          description: 'ER Diagrams, Relational Algebra, SQL, Normalization (1NF to BCNF), Transaction Processing & Concurrency Control.',
          estimated_hours: 24,
          subtopics: ['ER Model & Relational Algebra', 'SQL Queries & Joins', 'Functional Dependencies & Normalization', 'Transactions & Serializability', 'B/B+ Trees Indexing'],
          status: 'not_started',
          progress_pct: 0,
        },
        {
          id: 'coa',
          section_id: 'sec-core',
          subject: 'Computer Organization',
          title: 'Computer Architecture & Organization',
          description: 'Machine Instructions, Addressing Modes, ALU, Pipelining, Cache Memory Mapping, Interrupts.',
          estimated_hours: 26,
          subtopics: ['Instruction Set Architecture', 'Pipelining & Hazards', 'Cache Memory Mapping', 'Virtual Memory & TLB', 'I/O & Interrupts'],
          status: 'not_started',
          progress_pct: 0,
        },
      ],
    },
    {
      id: 'sec-advanced',
      roadmap_id: 'gate-cs-2027',
      title: 'ADVANCED CS THEORY',
      category: 'ADVANCED',
      topics: [
        {
          id: 'dsa',
          section_id: 'sec-advanced',
          subject: 'Data Structures',
          title: 'Data Structures & Algorithms',
          description: 'Arrays, Stacks, Queues, Binary Trees, Heaps, Hashing, Graph Algorithms, Dynamic Programming, Greedy Methods.',
          estimated_hours: 35,
          subtopics: ['Linear Data Structures', 'Trees & Binary Search Trees', 'Heaps & Priority Queues', 'Graph Traversal (BFS, DFS)', 'Greedy & Dynamic Programming', 'Asymptotic Complexity Analysis'],
          status: 'not_started',
          progress_pct: 0,
        },
        {
          id: 'toc',
          section_id: 'sec-advanced',
          subject: 'TOC',
          title: 'Theory of Computation',
          description: 'Regular Languages & DFA/NFA, Context-Free Grammars & Pushdown Automata, Turing Machines & Decidability.',
          estimated_hours: 22,
          subtopics: ['DFA, NFA & Regular Expressions', 'Pumping Lemma', 'CFG & Pushdown Automata', 'Turing Machines & Halting Problem', 'Undecidability Classes'],
          status: 'not_started',
          progress_pct: 0,
        },
        {
          id: 'compiler-design',
          section_id: 'sec-advanced',
          subject: 'Compiler Design',
          title: 'Compiler Design & Optimization',
          description: 'Lexical Analysis, Parsing (LL, LR, LALR), Syntax Directed Translation, Code Generation & Optimization.',
          estimated_hours: 18,
          subtopics: ['Lexical Analysis & Tokens', 'LL(1) & LR Parsing', 'Syntax-Directed Translation', 'Intermediate Code Generation', 'Code Optimization'],
          status: 'not_started',
          progress_pct: 0,
        },
      ],
    },
    {
      id: 'sec-exam-mode',
      roadmap_id: 'gate-cs-2027',
      title: 'EXAM MODE',
      category: 'EXAM MODE',
      topics: [
        {
          id: 'pyq-marathon',
          section_id: 'sec-exam-mode',
          subject: 'General Aptitude',
          title: 'GATE 10-Year PYQ Marathon',
          description: 'Solve last 10 years official GATE CS previous year questions with step-by-step solutions.',
          estimated_hours: 40,
          subtopics: ['GATE 2021-2026 Solved Papers', 'Topic-wise PYQ Drills', 'Formulae Revision Notebook'],
          status: 'not_started',
          progress_pct: 0,
        },
        {
          id: 'full-mocks',
          section_id: 'sec-exam-mode',
          subject: 'Engineering Mathematics',
          title: 'Full Length Test Series',
          description: 'Complete 65-question, 3-hour exam simulation tests with rank prediction & accuracy analytics.',
          estimated_hours: 30,
          subtopics: ['Full Length Mock 1 to 5', 'Sectional Speed Tests', 'Post-Mock Error Analysis'],
          status: 'not_started',
          progress_pct: 0,
        },
      ],
    },
  ],
};

const JEE_ROADMAP: RoadmapData = {
  id: 'jee-2027',
  exam: 'JEE Main',
  title: 'JEE Main & Advanced 2027 Master Plan',
  description: 'Structured Physics, Chemistry, and Mathematics pathway for JEE.',
  total_topics: 9,
  completed_topics: 1,
  overall_progress: 11,
  sections: [
    {
      id: 'jee-sec-phys',
      roadmap_id: 'jee-2027',
      title: 'PHYSICS PATH',
      category: 'FOUNDATION',
      topics: [
        {
          id: 'mechanics',
          section_id: 'jee-sec-phys',
          subject: 'Physics — Mechanics',
          title: 'Newtonian Mechanics & Kinematics',
          description: 'Vectors, Kinematics, Laws of Motion, Work Power Energy, Rotational Dynamics.',
          estimated_hours: 35,
          subtopics: ['Kinematics 1D & 2D', 'Newton Laws & Friction', 'Work Energy Theorem', 'Rotation & Torque'],
          status: 'completed',
          progress_pct: 100,
        },
        {
          id: 'electromagnetism',
          section_id: 'jee-sec-phys',
          subject: 'Physics — Electromagnetism',
          title: 'Electrostatics & Magnetism',
          description: 'Coulomb Law, Gauss Law, Capacitance, Current Electricity, Electromagnetic Induction.',
          estimated_hours: 30,
          subtopics: ['Electrostatics & Potential', 'Capacitors', 'Current Electricity & Circuits', 'EMI & AC Circuits'],
          status: 'in_progress',
          progress_pct: 40,
        },
      ],
    },
    {
      id: 'jee-sec-chem',
      roadmap_id: 'jee-2027',
      title: 'CHEMISTRY PATH',
      category: 'CORE',
      topics: [
        {
          id: 'organic-chem',
          section_id: 'jee-sec-chem',
          subject: 'Chemistry — Organic',
          title: 'GOC & Reaction Mechanisms',
          description: 'General Organic Chemistry, Resonance, Hydrocarbons, Organic Reactions.',
          estimated_hours: 30,
          subtopics: ['IUPAC & Isomerism', 'GOC & Electronic Effects', 'Hydrocarbons & Addition Reactions'],
          status: 'not_started',
          progress_pct: 0,
        },
        {
          id: 'physical-chem',
          section_id: 'jee-sec-chem',
          subject: 'Chemistry — Physical',
          title: 'Thermodynamics & Chemical Equilibrium',
          description: 'Mole Concept, Atomic Structure, Chemical Kinetics, Electrochemistry.',
          estimated_hours: 25,
          subtopics: ['Mole Concept', 'Thermodynamics & Energetics', 'Chemical & Ionic Equilibrium'],
          status: 'not_started',
          progress_pct: 0,
        },
      ],
    },
    {
      id: 'jee-sec-maths',
      roadmap_id: 'jee-2027',
      title: 'MATHEMATICS PATH',
      category: 'ADVANCED',
      topics: [
        {
          id: 'calculus',
          section_id: 'jee-sec-maths',
          subject: 'Mathematics — Calculus',
          title: 'Differential & Integral Calculus',
          description: 'Limits, Continuity, Derivatives, Definite Integration, Differential Equations.',
          estimated_hours: 40,
          subtopics: ['Limits & Continuity', 'Application of Derivatives', 'Definite Integrals', 'Area Under Curves'],
          status: 'not_started',
          progress_pct: 0,
        },
      ],
    },
  ],
};

export async function getRoadmap(exam: ExamCategory = 'GATE'): Promise<RoadmapData> {
  const base = exam.startsWith('JEE') ? JEE_ROADMAP : GATE_CS_ROADMAP;
  
  // Merge user topic progress from Supabase / localStorage
  try {
    const userProgressMap = await getUserTopicProgress();
    const updatedSections: RoadmapSection[] = base.sections.map((sec) => ({
      ...sec,
      topics: sec.topics.map((t) => {
        const u = userProgressMap[t.id];
        if (!u) return t;
        return {
          ...t,
          status: u.status || t.status,
          progress_pct: u.progress_pct ?? t.progress_pct,
        };
      }),
    }));

    let totalTopics = 0;
    let completedTopics = 0;
    let sumPct = 0;

    updatedSections.forEach((sec) => {
      sec.topics.forEach((t) => {
        totalTopics++;
        if (t.status === 'completed') completedTopics++;
        sumPct += t.progress_pct || 0;
      });
    });

    const overall_progress = totalTopics > 0 ? Math.round(sumPct / totalTopics) : 0;

    return {
      ...base,
      total_topics: totalTopics,
      completed_topics: completedTopics,
      overall_progress,
      sections: updatedSections,
    };
  } catch {
    return base;
  }
}

export async function getTopicById(topicId: string, exam: ExamCategory = 'GATE'): Promise<RoadmapTopic | null> {
  const roadmap = await getRoadmap(exam);
  for (const sec of roadmap.sections) {
    const found = sec.topics.find((t) => t.id === topicId || t.subject.toLowerCase().replace(/\s+/g, '-') === topicId);
    if (found) return found;
  }
  // Fallback check
  return roadmap.sections[1]?.topics[0] || null;
}

export async function updateTopicProgress(topicId: string, status: 'not_started' | 'in_progress' | 'completed', progressPct: number) {
  try {
    const local = getLocalUserProgress();
    local[topicId] = { status, progress_pct: progressPct, updated_at: new Date().toISOString() };
    localStorage.setItem(ROADMAP_PROGRESS_KEY, JSON.stringify(local));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_roadmap_progress').upsert({
        user_id: user.id,
        topic_id: topicId,
        status,
        progress_pct: progressPct,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      });
    }
  } catch (err) {
    console.warn('Failed to update topic progress:', err);
  }
}

function getLocalUserProgress(): Record<string, { status: any; progress_pct: number; updated_at?: string }> {
  try {
    const raw = localStorage.getItem(ROADMAP_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function getUserTopicProgress(): Promise<Record<string, { status: any; progress_pct: number }>> {
  const localMap = getLocalUserProgress();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localMap;

    const { data, error } = await supabase
      .from('user_roadmap_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) return localMap;
    const dbMap: Record<string, { status: any; progress_pct: number }> = { ...localMap };
    data?.forEach((row: any) => {
      dbMap[row.topic_id] = { status: row.status, progress_pct: row.progress_pct };
    });
    return dbMap;
  } catch {
    return localMap;
  }
}
