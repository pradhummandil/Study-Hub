import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

interface ExamCardItem {
  slug: string;
  name: string;
  category: string;
  papersLabel: string;
  practiceLabel: string;
  mocksLabel: string;
  badge: string;
}

const EXAM_CARDS: ExamCardItem[] = [
  { slug: 'gate', name: 'GATE', category: 'Engineering & Tech', papersLabel: 'Official PYQs (2010–2024)', practiceLabel: '3,200+ Practice Items', mocksLabel: 'Full Length Simulator', badge: 'Official PYQs' },
  { slug: 'jee-main', name: 'JEE Main', category: 'Engineering Entrance', papersLabel: 'Official PYQs (2015–2024)', practiceLabel: 'Physics, Chem, Math', mocksLabel: 'NTA Exam Format', badge: 'Verified Content' },
  { slug: 'jee-advanced', name: 'JEE Advanced', category: 'Engineering Entrance', papersLabel: 'IIT Papers & Solutions', practiceLabel: 'Advanced Numerical Problems', mocksLabel: 'Multi-Select Mocks', badge: 'Verified Content' },
  { slug: 'neet-ug', name: 'NEET UG', category: 'Medical Entrance', papersLabel: 'Biology, Physics, Chem', practiceLabel: 'NCERT Exemplar Practice', mocksLabel: 'Timed Test Player', badge: 'Official Syllabus' },
  { slug: 'cuet', name: 'CUET', category: 'University Entrance', papersLabel: 'Domain & General Papers', practiceLabel: 'Section-wise Tests', mocksLabel: 'Speed Practice', badge: 'Verified Content' },
  { slug: 'upsc', name: 'UPSC CSE', category: 'Civil Services', papersLabel: 'Prelims GS & CSAT', practiceLabel: 'Subject Question Bank', mocksLabel: 'Mains Guidance', badge: 'Structured Prep' },
  { slug: 'clat', name: 'CLAT', category: 'Law Entrance', papersLabel: 'Legal Reasoning & English', practiceLabel: 'Reading Comprehension', mocksLabel: 'Speed Mocks', badge: 'Verified Content' },
  { slug: 'cat', name: 'CAT', category: 'Management Entrance', papersLabel: 'VARC, DILR & Quant', practiceLabel: 'Sectional Tests', mocksLabel: 'Adaptive Mock Series', badge: 'Verified Content' },
  { slug: 'ssc', name: 'SSC CGL', category: 'Government Staff', papersLabel: 'Tier I & Tier II PYQs', practiceLabel: 'General Awareness & Quant', mocksLabel: 'Full Speed Tests', badge: 'Verified Content' },
];

export const ExamExplorerGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="explore-section" className="py-20 md:py-28 bg-[#EDF6FF] border-b border-slate-200/70 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#287BFF]/10 text-[#287BFF] text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Exam Catalog Explorer</span>
            </div>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#062B3D] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Preparing for something specific?
            </h2>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">
              Explore official papers, structured question banks, adaptive practice, and full exam simulators for major competitive exams.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="px-6 py-3 rounded-full bg-white border border-slate-300 text-[#062B3D] text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 shrink-0 self-start md:self-end cursor-pointer"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#287BFF]" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAM_CARDS.map((exam, idx) => (
            <motion.div
              key={exam.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => navigate(`/exams/${exam.slug}`)}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-[#287BFF]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#287BFF] bg-[#287BFF]/10 px-2.5 py-1 rounded-full">
                    {exam.category}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {exam.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#062B3D] group-hover:text-[#287BFF] transition-colors mb-4">
                  {exam.name}
                </h3>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#287BFF]" />
                    <span>{exam.papersLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#6F7CFF]" />
                    <span>{exam.practiceLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-[#5CE1E6]" />
                    <span>{exam.mocksLabel}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#062B3D] group-hover:text-[#287BFF] transition-colors">
                <span>Explore {exam.name} hub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
