import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const principles = [
  {
    num: '01',
    title: 'Consistency beats intensity.',
    body: "Two focused hours every day beats a 12-hour marathon on Sunday. We build systems that hold when motivation doesn't.",
  },
  {
    num: '02',
    title: "Everyone's roadmap looks different.",
    body: 'Your exam, your schedule, your gaps. Cookie-cutter plans fail because they were never built for you to begin with.',
  },
  {
    num: '03',
    title: 'Asking for help is a skill, not a weakness.',
    body: "The students who improve fastest aren't the smartest — they're the ones who ask the right questions and actually act on the answers.",
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About — Study Hub</title>
        <meta name="description" content="I'm not a platform. I'm one person who remembers being lost too. Here's why I started guiding students." />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-4xl sm:text-6xl font-normal leading-tight max-w-3xl tracking-[-1.5px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          I'm not a platform. I'm one person who remembers being <span className="text-gradient-accent">lost</span> too.
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground mt-6 max-w-2xl leading-relaxed text-base sm:text-lg">
          I spent two years staring at a study plan I'd built and rebuilt a dozen times, wondering why nothing was sticking. Eventually I figured it out — and now I help others skip the part where they have to figure it out alone.
        </p>
      </div>

      {/* Photo + Story */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo placeholder */}
          <div className="liquid-glass-card rounded-2xl aspect-[4/5] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground tracking-wide">Add your photo</p>
          </div>

          {/* Narrative */}
          <div className="flex flex-col gap-6">
            <p className="text-muted-foreground leading-relaxed">
              I prepared for competitive exams twice. The first time, I had no real system — just a pile of books, a YouTube queue, and a vague sense that working harder would eventually click. It didn't. I failed, felt embarrassed, and took almost a year to regroup.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The second time was different, not because I worked more, but because I finally understood what I actually needed to change. It wasn't the books or the hours — it was the sequence, the specificity, and the willingness to cut what wasn't working. I cleared. And I started noting down what had actually helped.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That's what this is. Not a coaching institute, not a content platform. Just a person who's been through it, keeps up with what works now, and talks to students one at a time. If that's the kind of help you're looking for, I'm here.
            </p>
          </div>
        </div>
      </div>

      {/* What I believe — full-bleed light break section for visual rhythm */}
      <div style={{ background: 'hsl(0 0% 96%)' }} className="w-full py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-16" style={{ color: 'hsl(0 0% 40%)' }}>
            What I believe
          </p>
          <div className="flex flex-col gap-6">
            {principles.map(({ num, title, body }) => (
              <div
                key={num}
                className="liquid-glass-light rounded-2xl p-8 flex gap-8 items-start"
              >
                <span
                  className="text-3xl shrink-0 w-14"
                  style={{ fontFamily: "'Instrument Serif', serif", color: 'hsl(0 0% 55%)' }}
                >
                  {num}
                </span>
                <div>
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ fontFamily: "'Instrument Serif', serif", color: 'hsl(0 0% 8%)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'hsl(0 0% 35%)' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32 text-center">
        <h2
          className="text-3xl sm:text-4xl font-normal text-foreground tracking-[-1px]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Let's figure out your next step together.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
          First call is free. No commitment required — just show up.
        </p>
        <Link
          to="/reach-us"
          className="liquid-glass rounded-full px-10 py-4 text-base text-foreground mt-10 inline-flex items-center justify-center hover:scale-[1.03] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Begin Journey
        </Link>
      </div>
    </>
  );
}
