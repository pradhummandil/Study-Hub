// ─── Adaptive Exam Simulation Engine ──────────────────────────────────────────
import type {
  ExamSimulationConfig,
  ExamSimulationResultData,
} from '../../types/phase5';

export const SAMPLE_EXAM_CONFIGS: ExamSimulationConfig[] = [
  {
    id: 'gate-cs-sim',
    exam: 'GATE',
    title: 'GATE 2026 CS Full Simulation',
    durationMinutes: 180,
    calculatorAllowed: true,
    sections: [
      { name: 'General Aptitude', questionCount: 10, marksPerQuestion: 1.5, negativeMarkingRatio: 0.33 },
      { name: 'Computer Science & IT', questionCount: 55, marksPerQuestion: 1.8, negativeMarkingRatio: 0.33 },
    ],
    instructions: [
      'Total duration is 180 minutes.',
      'Scientific calculator is available on-screen.',
      'Negative marking: 1/3 mark deducted for incorrect MCQs.',
      'Questions can be marked for review and answered later.',
    ],
  },
  {
    id: 'jee-adv-sim',
    exam: 'JEE Advanced',
    title: 'JEE Advanced Paper 1 Simulation',
    durationMinutes: 180,
    calculatorAllowed: false,
    sections: [
      { name: 'Physics', questionCount: 18, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Chemistry', questionCount: 18, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Mathematics', questionCount: 18, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
    ],
    instructions: [
      'Total duration: 180 minutes.',
      'No calculator permitted.',
      'Negative marking applies to incorrect responses.',
    ],
  },
  {
    id: 'neet-bio-sim',
    exam: 'NEET',
    title: 'NEET Full Length Mock Simulation',
    durationMinutes: 200,
    calculatorAllowed: false,
    sections: [
      { name: 'Physics', questionCount: 45, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Chemistry', questionCount: 45, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Biology (Botany & Zoology)', questionCount: 90, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
    ],
    instructions: [
      'Total duration: 200 minutes.',
      '4 marks awarded for correct answer, 1 mark deducted for incorrect.',
    ],
  },
];

export function calculateExamSimulationResult(
  config: ExamSimulationConfig,
  answers: Record<number, string>,
  questions: any[],
  timeSpentSec: number
): ExamSimulationResultData {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let negativeMarksLost = 0;
  let totalMaxMarks = 0;

  const topicStats: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q, idx) => {
    const sectionName = q.section || config.sections[0]?.name || 'General';
    const secConfig = config.sections.find((s) => s.name === sectionName) || config.sections[0];
    const marks = secConfig?.marksPerQuestion || 2;
    const negRatio = secConfig?.negativeMarkingRatio || 0.33;

    totalMaxMarks += marks;
    const topic = q.topic || sectionName;

    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    topicStats[topic].total += 1;

    const userAns = answers[idx];
    if (!userAns) {
      skippedCount += 1;
    } else if (userAns === q.correctAnswer) {
      correctCount += 1;
      score += marks;
      topicStats[topic].correct += 1;
    } else {
      incorrectCount += 1;
      const penalty = marks * negRatio;
      negativeMarksLost += penalty;
      score -= penalty;
    }
  });

  const attemptedCount = correctCount + incorrectCount;
  const totalQuestions = questions.length;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const attemptRate = totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0;
  const avgTimePerQuestionSec = attemptedCount > 0 ? Math.round(timeSpentSec / attemptedCount) : 0;

  // Derive "What cost you marks?" reasons empirically
  const costMarksReasons: string[] = [];
  if (negativeMarksLost > 0) {
    costMarksReasons.push(`${Math.round(negativeMarksLost)} marks lost due to negative marking on incorrect attempts.`);
  }
  if (skippedCount > totalQuestions * 0.25) {
    costMarksReasons.push(`${skippedCount} questions left unattempted due to time management or difficulty.`);
  }
  Object.entries(topicStats).forEach(([t, s]) => {
    const acc = Math.round((s.correct / s.total) * 100);
    if (s.total >= 2 && acc < 50) {
      costMarksReasons.push(`${t} accuracy fell below target at ${acc}%.`);
    }
  });

  // Time strategy insight
  let timeStrategyInsight = 'Your pacing across questions was steady and well-balanced.';
  if (avgTimePerQuestionSec > 180) {
    timeStrategyInsight = `You spent an average of ${Math.round(avgTimePerQuestionSec / 60)} minutes per question, leading to a rush near test conclusion.`;
  } else if (attemptRate < 60) {
    timeStrategyInsight = `Early exit or slow speed left ${skippedCount} questions unattempted. Focus on speed drills.`;
  }

  return {
    score: Math.max(0, Math.round(score * 10) / 10),
    totalMarks: Math.round(totalMaxMarks),
    accuracy,
    attemptRate,
    avgTimePerQuestionSec,
    negativeMarksLost: Math.round(negativeMarksLost * 10) / 10,
    skippedCount,
    topicPerformance: Object.entries(topicStats).map(([t, s]) => ({
      topic: t,
      correct: s.correct,
      total: s.total,
    })),
    costMarksReasons,
    timeStrategyInsight,
  };
}
