import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Study Hub</title>
      </Helmet>
      <div className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <p
          className="text-8xl text-muted-foreground/30 font-normal select-none"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          404
        </p>
        <h1
          className="mt-6 text-3xl sm:text-4xl font-normal text-foreground tracking-[-1px] max-w-md"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Looks like this page went to study.
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-xs leading-relaxed">
          It's not here — but you probably don't need it anyway. Head back and pick a direction.
        </p>
        <Link
          to="/"
          className="liquid-glass rounded-full px-8 py-3.5 text-sm text-foreground mt-10 inline-flex items-center justify-center hover:scale-[1.03] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Back home
        </Link>
      </div>
    </>
  );
}
