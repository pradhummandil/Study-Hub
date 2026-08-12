// ─── StudyMate Advanced Tutor & Socratic Mode Engine ──────────────────────────
import type { TutorPersonaMode, ProgressiveHint } from '../../types/phase5';

export function getTutorInstruction(mode: TutorPersonaMode): string {
  switch (mode) {
    case 'Socratic mode':
      return `\n\nSOCRATIC TUTOR MODE MANDATE:
- DO NOT reveal the final answer immediately.
- Guide the student step-by-step by asking thought-provoking sub-questions.
- Start by assessing their current understanding (e.g. "What do you think happens when...?", "Which formula applies here?").
- If the student gives an incomplete or incorrect answer, provide a small progressive hint rather than giving the solution away.`;

    case 'Explain my mistake':
      return `\n\nEXPLAIN MY MISTAKE MODE MANDATE:
- Identify the exact conceptual or calculation trap that led to the wrong answer.
- Highlight common pitfalls and misinterpretations for competitive exams.
- Provide the correct reasoning step-by-step.
- Re-enforce with a similar quick checkpoint question.`;

    case 'Test me':
      return `\n\nTEST ME MODE MANDATE:
- Pose ONE clear, exam-standard question at a time.
- Wait for the student's answer before revealing the solution or next question.
- Format options clearly as A, B, C, D if multiple choice or ask for numerical output.`;

    case 'Teach me':
      return `\n\nTEACH ME MODE MANDATE:
- Teach concepts starting from first principles with simple language.
- Use a concrete real-world analogy.
- Detail the key formulas, definitions, and exam relevance.
- Provide a summary box of key takeaways.`;

    case 'Revision mode':
      return `\n\nREVISION MODE MANDATE:
- Provide high-density, high-yield bullet points.
- Focus on critical formulas, mnemonics, conditions, and past exam trends.
- Keep output concise for rapid review.`;

    case 'Exam mode':
      return `\n\nEXAM MODE MANDATE:
- Maintain strict exam standards (time constraints, precise notation, marking scheme awareness).
- Focus on speed techniques, trick detection, and exam strategy.`;

    default:
      return '';
  }
}

export function generateProgressiveHints(
  _question: string,
  concept: string,
  solution: string
): ProgressiveHint[] {
  return [
    {
      level: 1,
      hintText: `💡 **Hint 1 (Conceptual Direction):** Think about the core principle of **${concept}**. What fundamental definition or rule applies here?`,
    },
    {
      level: 2,
      hintText: `💡 **Hint 2 (Formula / Key Relation):** Write down the formula or relation connecting the given parameters for **${concept}**. Check your units and initial boundary conditions.`,
    },
    {
      level: 3,
      hintText: `💡 **Hint 3 (Calculation Step):** Substitute the given values into the equation. Be careful of common algebraic or arithmetic traps!`,
      solutionText: `✅ **Full Solution:**\n${solution}`,
    },
  ];
}
