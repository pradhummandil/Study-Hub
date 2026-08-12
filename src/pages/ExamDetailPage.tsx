// src/pages/ExamDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, ShieldCheck, CheckCircle2, Play, Layers } from 'lucide-react';
import { getExamBySlug, type ExamCatalogItem } from '../lib/exam/examCatalog';
import { fetchExamSources, type ExamSource } from '../lib/exam/examSources';

export default function ExamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [exam, setExam] = useState<ExamCatalogItem | null>(null);
  const [sources, setSources] = useState<ExamSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const found = await getExamBySlug(slug);
      if (found) {
        setExam(found);
        const s = await fetchExamSources(found.id);
        setSources(s);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Loading exam specification...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Exam Not Found</h2>
        <p className="text-xs text-muted-foreground">We couldn't find the requested exam specification in our catalog.</p>
        <Link to="/exams" className="gradient-cta px-6 py-2 rounded-full text-xs text-slate-950 font-bold inline-block">
          Return to Exam Catalog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{exam.name} Official Specification & PYQs — Study Hub</title>
        <meta name="description" content={`Official information, syllabus, pattern, and PYQs for ${exam.name}. Verified by ${exam.organizer}.`} />
      </Helmet>

      <div className="px-6 py-12 max-w-5xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="liquid-glass-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold uppercase border border-cyan-500/30">
                  {exam.category}
                </span>
                <span className="text-xs text-muted-foreground font-mono">• Cycle: {exam.currentCycle}</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {exam.name}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">{exam.shortDesc}</p>
            </div>

            <div className="liquid-glass border border-emerald-500/30 p-4 rounded-2xl text-right shrink-0">
              <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1 mb-1">
                <ShieldCheck className="w-4 h-4" /> {exam.availabilityBadge}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono block">
                Last Verified: {exam.lastVerifiedAt}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Official Organizer</span>
              <span className="font-semibold text-slate-100">{exam.organizer}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Target Cycle</span>
              <span className="font-semibold text-cyan-300">{exam.currentCycle} Examination</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Official Web Source</span>
              <a
                href={exam.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{exam.officialUrl.replace('https://', '')}</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Official Source Registry Card */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal text-foreground flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Official Source Registry & Verification Logs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div key={src.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    {src.sourceType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500 font-mono">Checked: {src.lastCheckedAt}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">{src.sourceName}</h4>
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <ExternalLink className="w-3 h-3" /> {src.sourceUrl}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Subjects & Structure */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
          <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Syllabus & Core Subject Structure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {exam.subjects.map((subj, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{subj}</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Practice & Mock Test Call To Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Ready to test your preparation for {exam.name}?
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Attempt official PYQ simulations or custom practice sets. Personalized analytics require signing in.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/practice"
              state={{ exam: exam.id }}
              className="gradient-cta px-6 py-2.5 rounded-full text-xs text-slate-950 font-bold inline-flex items-center gap-1.5 shadow-md"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Practice Official PYQs</span>
            </Link>

            <Link
              to="/mock-tests"
              state={{ exam: exam.id }}
              className="liquid-glass px-6 py-2.5 rounded-full text-xs text-foreground font-semibold border border-white/20 hover:border-white/40 transition-all inline-flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>View Mock Tests</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
