// ─── StudyMate Doubt Solver Engine ───────────────────────────────────────────
import type { DoubtSolverResult } from '../../types/phase5';

export function parseDoubtResponse(aiText: string, queryInput: string): DoubtSolverResult {
  // Graceful fallback parser extracting structured sections from AI markdown or generating template
  const questionMatch = aiText.match(/Question Understood:?\s*([\s\S]*?)(?=Concept Identified:|Step-by-Step Solution:|$)/i);
  const conceptMatch = aiText.match(/Concept Identified:?\s*([\s\S]*?)(?=Step-by-Step Solution:|Common Trap:|$)/i);
  const solutionMatch = aiText.match(/Step-by-Step Solution:?\s*([\s\S]*?)(?=Common Trap:|Similar Practice:|$)/i);
  const trapMatch = aiText.match(/Common Trap:?\s*([\s\S]*?)(?=Similar Practice:|$)/i);

  const questionExtracted = questionMatch ? questionMatch[1].trim() : queryInput || 'Provided question problem statement';
  const conceptIdentified = conceptMatch ? conceptMatch[1].trim() : 'Core Concept Analysis';
  
  let steps: string[] = [];
  if (solutionMatch) {
    steps = solutionMatch[1]
      .split(/\n(?=\d+\.|\*|-)/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (steps.length === 0) {
    steps = [
      '1. Identify given parameters and target variables.',
      '2. Apply fundamental governing equation.',
      '3. Execute calculation step by step.',
      '4. Verify dimension, sign, and physical sanity of final answer.',
    ];
  }

  const commonMistakeTrap = trapMatch
    ? trapMatch[1].trim()
    : 'Common trap: Confusing formula conditions or ignoring unit conversions during calculation.';

  return {
    questionExtracted,
    conceptIdentified,
    stepByStepSolution: steps,
    commonMistakeTrap,
    similarPracticeQuestions: [
      {
        question: `Similar Practice Question: Calculate the resulting parameter when the initial conditions are scaled by a factor of 2.`,
        options: ['A) Doubled (2x)', 'B) Quadrupled (4x)', 'C) Unchanged', 'D) Halved (0.5x)'],
        answer: 'B',
        explanation: 'Due to the quadratic relationship in the governing formula, doubling the input quadruples the output.',
      },
    ],
  };
}

export function buildDoubtSolverPrompt(
  hasImage: boolean,
  _userText?: string
): string {
  return `\n\nDOUBT SOLVER MODE MANDATE:
Analyse the provided ${hasImage ? 'question image / OCR text' : 'question statement'}.
Output your answer in the following structured layout:

### Question Understood
[Concise transcript of the question parsed]

### Concept Identified
[Topic and primary governing formula/rule]

### Step-by-Step Solution
1. [First step]
2. [Second step]
3. [Final answer]

### Common Trap
[The specific mistake students usually make in this question]

### Similar Practice
[Provide one similar practice question with A/B/C/D choices]`;
}
