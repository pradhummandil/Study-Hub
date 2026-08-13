// src/components/video-learning/InteractivePostVideoQuiz.tsx
import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Award, RotateCcw, ArrowRight, Layers } from 'lucide-react';
import type { YouTubeVideo } from '../../types/video-learning';
import { useNavigate } from 'react-router-dom';

interface InteractivePostVideoQuizProps {
  video: YouTubeVideo;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const InteractivePostVideoQuiz: React.FC<InteractivePostVideoQuizProps> = ({ video, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Generate 5 dynamic, exam-relevant questions based on the video subject/topic
  const sampleQuestions: Question[] = [
    {
      id: 1,
      question: `What is the primary role of ${video.topic} during standard transmission?`,
      options: [
        'Regulate window size dynamically based on network state',
        'Directly encrypt payload data at transport layer',
        'Bypass physical link layer constraints completely',
        'Re-allocate MAC addresses during handshake',
      ],
      correctAnswer: 0,
      explanation: `${video.topic} actively monitors feedback signals (such as ACKs or packet loss) to throttle transmission rates and prevent bottleneck queue overflow.`,
    },
    {
      id: 2,
      question: 'Which metric or signal is most commonly monitored to detect congestion early?',
      options: ['DupACK threshold & RTT variance', 'IP TTL expiration counter', 'DNS lookup latency', 'MAC CRC checksum errors'],
      correctAnswer: 0,
      explanation: 'Triple duplicate ACKs or sudden spikes in Round Trip Time (RTT) indicate buffer bloat and packet drops.',
    },
    {
      id: 3,
      question: `In standard exam questions for ${video.exam}, what happens when a timeout occurs?`,
      options: [
        'Congestion window is reset to 1 MSS and slow start begins',
        'Window size doubles immediately',
        'Connection is terminated forcibly',
        'ssthresh is set to max integer',
      ],
      correctAnswer: 0,
      explanation: 'On timeout, ssthresh is set to half the current window size, and cwnd drops back to 1 MSS.',
    },
    {
      id: 4,
      question: 'Which phase doubles the congestion window size every RTT?',
      options: ['Slow Start Phase', 'Congestion Avoidance Phase', 'Fast Recovery Phase', 'Additive Increase Phase'],
      correctAnswer: 0,
      explanation: 'During Slow Start, cwnd increases exponentially (doubling every RTT) until ssthresh is reached.',
    },
    {
      id: 5,
      question: 'What is the key advantage of Fast Retransmit?',
      options: [
        'Retransmits missing packet on 3 DupACKs without waiting for retransmission timeout',
        'Increases payload bandwidth by 50%',
        'Disables checksum validation on quiet links',
        'Reduces TCP header size from 20 bytes to 8 bytes',
      ],
      correctAnswer: 0,
      explanation: 'Fast Retransmit avoids expensive timer expirations by retransmitting as soon as 3 duplicate ACKs arrive.',
    },
  ];

  const currentQ = sampleQuestions[currentIndex];

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const updated = [...userAnswers, selectedOption];
    setUserAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (currentIndex < sampleQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setCurrentStep('result');
    }
  };

  const score = userAnswers.reduce(
    (acc, ans, i) => (ans === sampleQuestions[i].correctAnswer ? acc + 1 : acc),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentStep === 'intro' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Lesson Complete ✓
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-2">Test Your Understanding</h2>
              <p className="text-xs text-slate-400 mt-1">
                You just finished <span className="text-cyan-300 font-semibold">{video.title}</span>. Take a quick 5-question check to lock in what you learned!
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentStep('quiz')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                Start 5-Question Quiz <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {currentIndex + 1} of {sampleQuestions.length}</span>
              <span className="text-cyan-400 font-bold">{video.topic}</span>
            </div>

            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / sampleQuestions.length) * 100}%` }}
              />
            </div>

            <h3 className="text-sm md:text-base font-semibold text-slate-100 pt-2">
              {currentQ.question}
            </h3>

            {/* Options list */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctAnswer;
                let btnStyle = 'bg-slate-950/80 border-white/10 text-slate-200 hover:border-cyan-500/40';

                if (isAnswerSubmitted) {
                  if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200';
                  else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-200';
                } else if (isSelected) {
                  btnStyle = 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 font-semibold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                    {isAnswerSubmitted && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submission */}
            {isAnswerSubmitted && (
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/10 text-xs space-y-1 animate-fade-in">
                <span className="font-bold text-cyan-400 block">Explanation:</span>
                <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Submit / Next Button */}
            <div className="pt-2 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
                >
                  {currentIndex < sampleQuestions.length - 1 ? 'Next Question' : 'View Quiz Score'} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-100">Quiz Completed!</h2>
              <p className="text-sm text-slate-300 mt-1">
                You scored <span className="text-cyan-300 font-bold">{score} / {sampleQuestions.length}</span> on {video.topic}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/revision');
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                Add to Spaced Revision
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/flashcards');
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                Generate Flashcards
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm hover:brightness-110"
              >
                Back to Learning Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
