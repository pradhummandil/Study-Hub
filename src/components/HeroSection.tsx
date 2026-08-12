export const HeroSection = () => {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] min-h-[calc(100vh-88px)]">
      {/* H1 Heading */}
      <h1
        className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Where <em className="not-italic text-muted-foreground">dreams</em> rise{' '}
        <em className="not-italic text-muted-foreground">through the silence.</em>
      </h1>

      {/* Subtext Paragraph */}
      <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
        We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
      </p>

      {/* Hero CTA Button */}
      <button 
        className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform duration-300 cursor-pointer inline-flex items-center justify-center"
      >
        Begin Journey
      </button>
    </main>
  );
};
