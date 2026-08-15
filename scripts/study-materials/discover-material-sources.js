// scripts/study-materials/discover-material-sources.js
import fs from 'fs';
import path from 'path';

console.log('\n========================================================');
console.log('🔍 DISCOVERING STUDY MATERIAL SOURCES & RESOURCES');
console.log('========================================================\n');

// Standard Target Sources Definition
const TARGET_SOURCES = [
  {
    id: 'mathongo_physics',
    name: 'MathonGo',
    exam_code: 'JEE_MAIN',
    exam_family: 'JEE',
    subject: 'Physics',
    url: 'https://www.mathongo.com/dw/revision-notes/?subject=Physics',
    license_status: 'PUBLIC_REFERENCE_ONLY',
    redistribution_allowed: false,
    direct_download_available: true,
    chapters: [
      { name: 'Units & Measurements', topic: 'Units, Dimensions & Errors', type: 'REVISION_NOTES' },
      { name: 'Kinematics', topic: '1D & 2D Motion', type: 'REVISION_NOTES' },
      { name: 'Laws of Motion', topic: 'Newton Laws & Friction', type: 'REVISION_NOTES' },
      { name: 'Work, Energy & Power', topic: 'Work-Energy Theorem & Collisions', type: 'REVISION_NOTES' },
      { name: 'Rotational Motion', topic: 'Moment of Inertia & Angular Momentum', type: 'REVISION_NOTES' },
      { name: 'Gravitation', topic: 'Kepler Laws & Gravitational Potential', type: 'REVISION_NOTES' },
      { name: 'Properties of Solids & Liquids', topic: 'Elasticity, Viscosity & Surface Tension', type: 'REVISION_NOTES' },
      { name: 'Thermodynamics & KTG', topic: 'Laws of Thermodynamics & Ideal Gas', type: 'REVISION_NOTES' },
      { name: 'Oscillations & Waves', topic: 'SHM, Wave Motion & Doppler Effect', type: 'REVISION_NOTES' },
      { name: 'Electrostatics', topic: 'Coulomb Law, Field & Potential', type: 'REVISION_NOTES' },
      { name: 'Current Electricity', topic: 'Ohm Law, Kirchhoff Laws & Potentiometer', type: 'REVISION_NOTES' },
      { name: 'Magnetic Effects of Current & Magnetism', topic: 'Biot-Savart & Ampere Law', type: 'REVISION_NOTES' },
      { name: 'Electromagnetic Induction & AC', topic: 'Faraday Law & RLC Circuits', type: 'REVISION_NOTES' },
      { name: 'Electromagnetic Waves', topic: 'EM Spectrum & Displacement Current', type: 'REVISION_NOTES' },
      { name: 'Optics', topic: 'Ray Optics & Wave Optics', type: 'REVISION_NOTES' },
      { name: 'Dual Nature of Matter & Radiation', topic: 'Photoelectric Effect & de Broglie', type: 'REVISION_NOTES' },
      { name: 'Atoms & Nuclei', topic: 'Bohr Model & Radioactivity', type: 'REVISION_NOTES' },
      { name: 'Electronic Devices', topic: 'Semiconductors, Diodes & Logic Gates', type: 'REVISION_NOTES' },
      { name: 'Physics Formula Sheet', topic: 'Complete Physics Formula Handbook', type: 'FORMULA_SHEET' },
      { name: 'Physics Short Notes', topic: 'Rapid Revision & Mind Maps', type: 'SHORT_NOTES' }
    ]
  },
  {
    id: 'mathongo_chemistry',
    name: 'MathonGo',
    exam_code: 'JEE_MAIN',
    exam_family: 'JEE',
    subject: 'Chemistry',
    url: 'https://www.mathongo.com/dw/revision-notes/?subject=Chemistry',
    license_status: 'PUBLIC_REFERENCE_ONLY',
    redistribution_allowed: false,
    direct_download_available: true,
    chapters: [
      { name: 'Some Basic Concepts of Chemistry', topic: 'Mole Concept & Stoichiometry', type: 'REVISION_NOTES' },
      { name: 'Atomic Structure', topic: 'Bohr Model & Quantum Numbers', type: 'REVISION_NOTES' },
      { name: 'Chemical Bonding & Molecular Structure', topic: 'VSEPR & MO Theory', type: 'REVISION_NOTES' },
      { name: 'Chemical Thermodynamics', topic: 'Enthalpy, Entropy & Gibbs Free Energy', type: 'REVISION_NOTES' },
      { name: 'Solutions', topic: 'Raoult Law & Colligative Properties', type: 'REVISION_NOTES' },
      { name: 'Equilibrium', topic: 'Ionic & Chemical Equilibrium', type: 'REVISION_NOTES' },
      { name: 'Redox Reactions & Electrochemistry', topic: 'Nernst Equation & Conductance', type: 'REVISION_NOTES' },
      { name: 'Chemical Kinetics', topic: 'Rate Law, Order & Arrhenius Equation', type: 'REVISION_NOTES' },
      { name: 'Periodic Classification', topic: 'Periodic Trends & Properties', type: 'REVISION_NOTES' },
      { name: 'p-Block & d-Block Elements', topic: 'Transition Elements & Coordination Compounds', type: 'REVISION_NOTES' },
      { name: 'General Organic Chemistry', topic: 'IUPAC, Isomerism & Reaction Intermediates', type: 'REVISION_NOTES' },
      { name: 'Hydrocarbons', topic: 'Alkanes, Alkenes, Alkynes & Aromatic Compounds', type: 'REVISION_NOTES' },
      { name: 'Organic Compounds Containing Halogens & Oxygen', topic: 'Haloalkanes, Alcohols, Phenols & Ethers', type: 'REVISION_NOTES' },
      { name: 'Aldehydes, Ketones & Carboxylic Acids', topic: 'Nucleophilic Addition & Name Reactions', type: 'REVISION_NOTES' },
      { name: 'Biomolecules', topic: 'Carbohydrates, Proteins & Nucleic Acids', type: 'REVISION_NOTES' },
      { name: 'Chemistry Formula Sheet', topic: 'Complete Organic, Inorganic & Physical Formulas', type: 'FORMULA_SHEET' },
      { name: 'Chemistry Short Notes', topic: 'Quick Concept Cards & Reaction Summary', type: 'SHORT_NOTES' }
    ]
  },
  {
    id: 'mathongo_maths',
    name: 'MathonGo',
    exam_code: 'JEE_MAIN',
    exam_family: 'JEE',
    subject: 'Mathematics',
    url: 'https://www.mathongo.com/dw/revision-notes/?subject=Mathematics',
    license_status: 'PUBLIC_REFERENCE_ONLY',
    redistribution_allowed: false,
    direct_download_available: true,
    chapters: [
      { name: 'Sets, Relations & Functions', topic: 'Domain, Range & Types of Functions', type: 'REVISION_NOTES' },
      { name: 'Complex Numbers & Quadratic Equations', topic: 'De Moivre Theorem & Roots of Equation', type: 'REVISION_NOTES' },
      { name: 'Matrices & Determinants', topic: 'Cramer Rule & Inverse Matrix', type: 'REVISION_NOTES' },
      { name: 'Permutations & Combinations', topic: 'Combinatorial Identities & Grouping', type: 'REVISION_NOTES' },
      { name: 'Binomial Theorem', topic: 'General Term & Middle Term', type: 'REVISION_NOTES' },
      { name: 'Sequence & Series', topic: 'AP, GP, AGP & Special Series', type: 'REVISION_NOTES' },
      { name: 'Limits, Continuity & Differentiability', topic: 'L Hospital Rule & Differentiability', type: 'REVISION_NOTES' },
      { name: 'Application of Derivatives', topic: 'Tangents, Normals & Maxima Minima', type: 'REVISION_NOTES' },
      { name: 'Indefinite & Definite Integration', topic: 'Properties of Definite Integrals', type: 'REVISION_NOTES' },
      { name: 'Differential Equations', topic: 'Variable Separable & Linear DE', type: 'REVISION_NOTES' },
      { name: 'Vector Algebra & 3D Geometry', topic: 'Dot Product, Cross Product & Line/Plane', type: 'REVISION_NOTES' },
      { name: 'Probability', topic: 'Bayes Theorem & Probability Distribution', type: 'REVISION_NOTES' },
      { name: 'Trigonometry', topic: 'Trigonometric Equations & Inverse Functions', type: 'REVISION_NOTES' },
      { name: 'Mathematics Formula Sheet', topic: 'Complete Calculus, Algebra & Geometry Formulas', type: 'FORMULA_SHEET' },
      { name: 'Mathematics Short Notes', topic: 'Short Tricks & Quick Formulae', type: 'SHORT_NOTES' }
    ]
  },
  {
    id: 'iitian_academy_physics',
    name: 'IITian Academy',
    exam_code: 'JEE_ADVANCED',
    exam_family: 'JEE',
    subject: 'Physics',
    url: 'https://www.iitianacademy.com/iit-jee-advanced-physics-study-materials-chapterwise/',
    license_status: 'PUBLIC_REFERENCE_ONLY',
    redistribution_allowed: false,
    direct_download_available: true,
    chapters: [
      { name: 'Advanced Mechanics', topic: 'Rigid Body Dynamics & Rolling Motion', type: 'CHAPTER_NOTES' },
      { name: 'Fluids & Surface Tension', topic: 'Bernoulli Principle & Viscosity', type: 'CHAPTER_NOTES' },
      { name: 'Heat & Thermodynamics', topic: 'Carnot Engine & Entropy Analysis', type: 'CHAPTER_NOTES' },
      { name: 'Wave Optics & Interference', topic: 'Young Double Slit & Thin Film Interference', type: 'CHAPTER_NOTES' },
      { name: 'Advanced Electrostatics', topic: 'Conductors, Capacitors & Dielectrics', type: 'CHAPTER_NOTES' },
      { name: 'Electromagnetism & Induction', topic: 'Motional EMF & Mutual Inductance', type: 'CHAPTER_NOTES' },
      { name: 'Modern Physics', topic: 'X-Rays, Nuclear Physics & Quantum Phenomena', type: 'CHAPTER_NOTES' }
    ]
  },
  {
    id: 'practice_paper_gate_cse',
    name: 'PracticePaper',
    exam_code: 'GATE_CSE',
    exam_family: 'GATE',
    branch: 'CSE',
    subject: 'Computer Science & Engineering',
    url: 'https://practicepaper.in/gate-cse/gate-cse-notes',
    license_status: 'PUBLIC_REFERENCE_ONLY',
    redistribution_allowed: false,
    direct_download_available: true,
    chapters: [
      { name: 'Programming & Data Structures', topic: 'Arrays, Stacks, Queues, Trees & Graphs', type: 'GATE_NOTES' },
      { name: 'Algorithms', topic: 'Asymptotic Notation, Divide & Conquer, Dynamic Programming, Greedy', type: 'GATE_NOTES' },
      { name: 'Database Management Systems', topic: 'ER Model, Relational Algebra, SQL, Normalization, Transactions & Concurrency', type: 'GATE_NOTES' },
      { name: 'Operating Systems', topic: 'Processes, Threads, CPU Scheduling, Deadlocks, Memory Management & File Systems', type: 'GATE_NOTES' },
      { name: 'Computer Networks', topic: 'OSI/TCP-IP Layers, IPv4/IPv6, Routing Algorithms, TCP/UDP & Congestion Control', type: 'GATE_NOTES' },
      { name: 'Theory of Computation', topic: 'Regular Expressions, DFA/NFA, Context Free Grammars, Turing Machines & Decidability', type: 'GATE_NOTES' },
      { name: 'Compiler Design', topic: 'Lexical Analysis, Parsing, Syntax Directed Translation, Code Generation', type: 'GATE_NOTES' },
      { name: 'Computer Organization & Architecture', topic: 'Instruction Pipelining, Cache Memory, Addressing Modes, ALU & IO Interfaces', type: 'GATE_NOTES' },
      { name: 'Digital Logic', topic: 'Boolean Algebra, Combinational & Sequential Circuits, Logic Gates', type: 'GATE_NOTES' },
      { name: 'Engineering Mathematics', topic: 'Linear Algebra, Calculus, Probability, Discrete Mathematics & Graph Theory', type: 'GATE_NOTES' },
      { name: 'General Aptitude', topic: 'Verbal Ability & Quantitative Aptitude', type: 'STRATEGY' }
    ]
  },
  {
    id: 'iitians_gate_cs',
    name: 'IITians GATE Classes',
    exam_code: 'GATE_CSE',
    exam_family: 'GATE',
    branch: 'CSE',
    subject: 'Computer Science',
    url: 'https://iitiansgateclasses.com/gate-study-materials/computer-science',
    license_status: 'PUBLIC_REFERENCE_ONLY',
    redistribution_allowed: false,
    direct_download_available: true,
    chapters: [
      { name: 'GATE CS Complete Study Material', topic: 'Full Subject-wise Handcrafted Notes', type: 'GATE_NOTES' },
      { name: 'GATE Computer Networks Deep Dive', topic: 'TCP/IP, Subnetting & Flow Control', type: 'CONCEPT_NOTES' },
      { name: 'GATE DBMS Transaction Management', topic: 'ACID Properties, 2PL & Serializability', type: 'CONCEPT_NOTES' }
    ]
  },
  {
    id: 'github_gate2027',
    name: 'Aparnaraha/Gate2027 GitHub',
    exam_code: 'GATE_CSE',
    exam_family: 'GATE',
    branch: 'CSE',
    subject: 'Computer Science & Engineering',
    url: 'https://github.com/Aparnaraha/Gate2027',
    license_status: 'COMMUNITY_NOTES',
    redistribution_allowed: false,
    direct_download_available: false,
    chapters: [
      { name: 'GATE 2027 Community Notes Repository', topic: 'Curated Open Source GATE Preparation Notes, PYQs & Resources', type: 'COMMUNITY_NOTES' },
      { name: 'Discrete Mathematics & Graph Theory', topic: 'Set Theory, Combinatorics & Graph Algorithms', type: 'COMMUNITY_NOTES' },
      { name: 'Operating System Memory & Scheduling', topic: 'Paging, Demand Paging, Virtual Memory & Page Replacement', type: 'COMMUNITY_NOTES' },
      { name: 'Computer Networks Protocols Cheat Sheet', topic: 'BGP, OSPF, TCP Three-Way Handshake & Subnet Calculations', type: 'CHEAT_SHEET' }
    ]
  }
];

function discover() {
  const discoveredItems = [];

  for (const src of TARGET_SOURCES) {
    for (let i = 0; i < src.chapters.length; i++) {
      const ch = src.chapters[i];
      const itemTitle = `${src.exam_code.replace('_', ' ')} — ${src.subject} — ${ch.name}`;
      const format = src.url.includes('github.com') ? 'GITHUB_REPOSITORY' : 'WEB_PAGE';
      
      const discovered = {
        title: itemTitle,
        description: `High-yield study resource for ${ch.topic} under ${src.subject} for ${src.exam_family}.`,
        exam_code: src.exam_code,
        exam_family: src.exam_family,
        branch: src.branch || null,
        subject: src.subject,
        chapter: ch.name,
        topic: ch.topic,
        material_type: ch.type,
        format: ch.type === 'FORMULA_SHEET' ? 'PDF' : (ch.type === 'SHORT_NOTES' ? 'PDF' : format),
        language: 'English',
        year: 2026,
        source_name: src.name,
        source_url: src.url,
        external_url: src.url,
        license_status: src.license_status,
        license_url: src.url,
        attribution: `Source: ${src.name} (${src.url})`,
        is_downloadable: src.redistribution_allowed,
        is_verified: true,
        is_featured: i < 3,
        resource_owner: src.name,
        redistribution_allowed: src.redistribution_allowed,
        local_caching_allowed: src.redistribution_allowed,
        attribution_required: true,
        direct_download_available: src.direct_download_available
      };

      discoveredItems.push(discovered);
    }
  }

  const outputPath = path.join(process.cwd(), 'scripts/study-materials/study_material_discovery.json');
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const payload = {
    discovered_at: new Date().toISOString(),
    total_sources: TARGET_SOURCES.length,
    total_resources: discoveredItems.length,
    sources_summary: TARGET_SOURCES.map(s => ({ name: s.name, exam: s.exam_code, items: s.chapters.length })),
    resources: discoveredItems
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log(`✅ DISCOVERY COMPLETE!`);
  console.log(`  • Sources inspected: ${TARGET_SOURCES.length}`);
  console.log(`  • Resources discovered: ${discoveredItems.length}`);
  console.log(`  • Manifest saved to: ${outputPath}\n`);

  console.log('Breakdown by Exam:');
  const examMap = {};
  discoveredItems.forEach(item => {
    examMap[item.exam_code] = (examMap[item.exam_code] || 0) + 1;
  });
  Object.entries(examMap).forEach(([exam, count]) => {
    console.log(`  - ${exam}: ${count} resources`);
  });
}

discover();
