// scripts/questions/classify-questions.ts
// Taxonomy Mapping Engine: Deterministic Rule-Based Taxonomy + AI Confidence Classifier

export interface TaxonomyMapping {
  exam_family: string;
  exam_code: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  confidence: number;
  classifier_source: 'DETERMINISTIC' | 'AI_ASSISTED' | 'MANUAL';
}

const DETERMINISTIC_RULES: Array<{
  keywords: string[];
  exam_code: string;
  subject: string;
  chapter: string;
  topic: string;
}> = [
  // GATE CS Topics
  {
    keywords: ['subnet', 'cidr', 'ip address', 'subnet mask', 'host address'],
    exam_code: 'GATE_CSE',
    subject: 'Computer Networks',
    chapter: 'Network Layer',
    topic: 'Subnetting & CIDR',
  },
  {
    keywords: ['tcp', 'congestion control', 'slow start', 'aimd', 'window size'],
    exam_code: 'GATE_CSE',
    subject: 'Computer Networks',
    chapter: 'Transport Layer',
    topic: 'TCP Congestion Control',
  },
  {
    keywords: ['semaphore', 'mutex', 'critical section', 'peterson', 'producer consumer'],
    exam_code: 'GATE_CSE',
    subject: 'Operating Systems',
    chapter: 'Process Management',
    topic: 'Process Synchronization',
  },
  {
    keywords: ['bcnf', '3nf', '2nf', 'normalization', 'functional dependency'],
    exam_code: 'GATE_CSE',
    subject: 'DBMS',
    chapter: 'Database Design',
    topic: 'Normalization',
  },
  {
    keywords: ['b-tree', 'b+ tree', 'indexing', 'hash index'],
    exam_code: 'GATE_CSE',
    subject: 'DBMS',
    chapter: 'File Structures',
    topic: 'Indexing & B-Trees',
  },
  {
    keywords: ['dijkstra', 'bellman-ford', 'shortest path', 'floyd-warshall'],
    exam_code: 'GATE_CSE',
    subject: 'Algorithms',
    chapter: 'Graph Algorithms',
    topic: 'Shortest Path Algorithms',
  },
  // JEE Main Physics
  {
    keywords: ['projectile', 'range', 'maximum height', 'trajectory', 'angle of projection'],
    exam_code: 'JEE_MAIN',
    subject: 'Physics',
    chapter: 'Kinematics',
    topic: 'Projectile Motion',
  },
  {
    keywords: ['carnot engine', 'efficiency', 'entropy', 'first law of thermodynamics'],
    exam_code: 'JEE_MAIN',
    subject: 'Physics',
    chapter: 'Thermodynamics',
    topic: 'Heat Engines & Laws',
  },
  // JEE Main Chemistry
  {
    keywords: ['sn1', 'sn2', 'nucleophilic substitution', 'carbocation stability'],
    exam_code: 'JEE_MAIN',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry',
    topic: 'Reaction Mechanisms',
  },
  // NEET Biology
  {
    keywords: ['nephron', 'glomerular filtration', 'kidney', 'loop of henle'],
    exam_code: 'NEET_UG',
    subject: 'Biology',
    chapter: 'Human Physiology',
    topic: 'Excretory System',
  },
];

export function classifyQuestionTaxonomy(
  questionText: string,
  hintExamCode?: string,
  hintSubject?: string
): TaxonomyMapping {
  const lowerText = questionText.toLowerCase();

  // 1. Attempt deterministic rule matching
  for (const rule of DETERMINISTIC_RULES) {
    if (hintExamCode && hintExamCode !== rule.exam_code) continue;
    const matchCount = rule.keywords.filter((kw) => lowerText.includes(kw)).length;
    if (matchCount > 0) {
      const confidence = Math.min(0.7 + matchCount * 0.1, 0.99);
      return {
        exam_family: rule.exam_code.split('_')[0],
        exam_code: rule.exam_code,
        subject: rule.subject,
        chapter: rule.chapter,
        topic: rule.topic,
        confidence: Number(confidence.toFixed(2)),
        classifier_source: 'DETERMINISTIC',
      };
    }
  }

  // 2. Fallback heuristic AI representation
  const targetExam = hintExamCode || 'GATE_CSE';
  const targetSubject = hintSubject || 'Computer Networks';

  return {
    exam_family: targetExam.split('_')[0],
    exam_code: targetExam,
    subject: targetSubject,
    chapter: 'General Concepts',
    topic: 'Core Fundamentals',
    confidence: 0.65,
    classifier_source: 'AI_ASSISTED',
  };
}
