import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    q: 'What are you working on?',
    options: ['Exam prep', 'Building a routine', "Feeling stuck and don't know"],
  },
  {
    q: 'How much time do you have this week?',
    options: ['Under 5 hrs', '5–15 hrs', '15+ hrs'],
  },
  {
    q: 'What do you need most?',
    options: ['A plan', 'Accountability', 'Someone to talk to'],
  },
];

// ── Result logic — simple if/else, no fancy ML needed ────────────────────────
function getResult(answers: string[]): string {
  const [q1, , q3] = answers;
  if (q1 === "Feeling stuck and don't know") {
    return "Being stuck is usually a signal the approach needs changing — not that you need to try harder. A 20-minute conversation tends to reset the whole direction.";
  }
  if (q1 === 'Building a routine') {
    if (answers[1] === 'Under 5 hrs') {
      return "With limited time, what you study matters more than how long. Let's cut the noise and build a minimal effective plan around your real schedule.";
    }
    return "A routine that holds is one built around your actual life — not someone else's ideal. Let's map yours out together.";
  }
  // Exam prep
  if (q3 === 'A plan') {
    return "You're ready to move — you just need a clear roadmap. Let's build one specific to your exam, timeline, and weak spots.";
  }
  if (q3 === 'Accountability') {
    return "Having a plan isn't the hard part. Sticking to it is. Let's set up a system that keeps you honest, not just motivated.";
  }
  return "Sometimes the most useful thing is a real conversation about what's actually blocking you. No agenda — just an honest 20 minutes.";
}

// ── Progress dots ─────────────────────────────────────────────────────────────
const Dots = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2 mb-6" aria-label={`Question ${step + 1} of 3`}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i < step
            ? 'bg-gradient-to-r from-[hsl(38,92%,68%)] to-[hsl(271,76%,68%)] scale-110'
            : i === step
            ? 'bg-foreground scale-125'
            : 'bg-muted-foreground/30'
        }`}
      />
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const StartingPointQuiz = () => {
  const [step, setStep] = useState(0);          // 0-2 = questions, 3 = result
  const [answers, setAnswers] = useState<string[]>([]);

  const pick = (option: string) => {
    const next = [...answers, option];
    setAnswers(next);
    setStep(step < 2 ? step + 1 : 3);
  };

  const reset = () => { setStep(0); setAnswers([]); };

  return (
    <div className="relative z-10 bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Section label */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-8">
          Find your starting point
        </p>

        <div className="liquid-glass-card rounded-2xl p-8 sm:p-10">
          {step < 3 ? (
            /* ── Question card — key changes per step so CSS animation re-fires ── */
            <div key={step} className="animate-fade-rise">
              <Dots step={step} />
              <h3
                className="text-2xl sm:text-3xl font-normal text-foreground mb-8 leading-snug tracking-[-0.5px]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {QUESTIONS[step].q}
              </h3>
              <div className="flex flex-col gap-3">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pick(opt)}
                    className="liquid-glass rounded-xl px-5 py-4 text-left text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-[1.01] transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Result card ── */
            <div key="result" className="animate-fade-rise text-center">
              <Dots step={3} />
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
                Here's what I'd say
              </p>
              <p
                className="text-2xl sm:text-3xl font-normal text-foreground leading-snug tracking-[-0.5px] mb-8"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {getResult(answers)}
              </p>
              <Link
                to="/reach-us"
                className="gradient-cta rounded-full px-10 py-4 text-base inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Book your call
              </Link>
              <button
                onClick={reset}
                className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Start again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
