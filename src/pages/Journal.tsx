import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

type Post = {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  date: string;
  featured?: boolean;
};

const POSTS: Post[] = [
  {
    id: 1,
    title: 'The one thing that actually fixed my exam anxiety',
    category: 'Focus',
    excerpt: 'It wasn\'t breathing exercises. It wasn\'t "just sleep more." It was understanding what anxiety is actually telling you during prep.',
    readTime: '6 min read',
    date: 'Aug 2026',
    featured: true,
  },
  {
    id: 2,
    title: 'How to build a study routine that doesn\'t collapse by week 2',
    category: 'Habits',
    excerpt: 'Most routines fail because they\'re built for your ideal day, not your actual one. Here\'s how to make one that holds.',
    readTime: '5 min read',
    date: 'Jul 2026',
  },
  {
    id: 3,
    title: 'How to actually use past papers (most people do it wrong)',
    category: 'Strategy',
    excerpt: 'Doing PYQs at the end of prep is too late. Here\'s the counter-intuitive way to use them from day one.',
    readTime: '4 min read',
    date: 'Jul 2026',
  },
  {
    id: 4,
    title: 'Burnout recovery — what worked, what didn\'t',
    category: 'Wellbeing',
    excerpt: 'I\'ve seen students take a week off and come back sharper. I\'ve also seen them never come back. The difference isn\'t willpower.',
    readTime: '7 min read',
    date: 'Jun 2026',
  },
  {
    id: 5,
    title: 'Choosing what to study first (when everything feels urgent)',
    category: 'Strategy',
    excerpt: 'There\'s a simple filter that cuts through the overwhelm. It\'s not about importance — it\'s about return on time.',
    readTime: '4 min read',
    date: 'Jun 2026',
  },
  {
    id: 6,
    title: 'Staying consistent without motivation',
    category: 'Habits',
    excerpt: 'Motivation is unreliable. Here\'s what actually shows up on the days it doesn\'t.',
    readTime: '5 min read',
    date: 'May 2026',
  },
  {
    id: 7,
    title: 'Why your notes aren\'t helping you remember anything',
    category: 'Focus',
    excerpt: 'Writing things down feels productive. But most notes are just passive transcription. Here\'s how to make them active.',
    readTime: '4 min read',
    date: 'May 2026',
  },
];

const featured = POSTS.find((p) => p.featured)!;
const rest = POSTS.filter((p) => !p.featured).slice(0, 6);

export default function Journal() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscribe:', email);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <>
      <Helmet>
        <title>Journal — Study Hub</title>
        <meta name="description" content="Short, honest writing on studying, focus, and figuring things out." />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Notes from the <span className="text-gradient-accent">process.</span>
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground max-w-xl mt-6 leading-relaxed">
          Short, honest writing on studying, focus, and figuring things out.
        </p>
      </div>

      {/* Recently Asked — pill ticker above the post grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Recently asked</p>
        <div className="flex flex-wrap gap-2">
          {[
            'How do I stop procrastinating?',
            'Best way to revise the night before?',
            'How many hours should I study?',
            'What if I don\'t finish the syllabus?',
            'How to stay focused for 3+ hours?',
            'When should I start solving PYQs?',
            'How do I handle exam anxiety?',
            'Is it too late to start now?',
          ].map((q) => (
            <button
              key={q}
              type="button"
              className="liquid-glass rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              onClick={() => {/* wire up search later */}}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Featured post */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <Link to={`/journal/${featured.id}`} className="block group">
          <div className="liquid-glass-card rounded-2xl overflow-hidden grid md:grid-cols-2 hover:scale-[1.005] transition-transform duration-300">
            {/* Image placeholder */}
            <div className="liquid-glass aspect-video md:aspect-auto flex items-center justify-center min-h-[220px]">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground">Featured image</p>
              </div>
            </div>
            {/* Text */}
            <div className="p-8 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{featured.category}</p>
              <h2
                className="text-2xl text-foreground font-normal leading-snug mb-3 group-hover:text-foreground/80 transition-colors"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {featured.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{featured.excerpt}</p>
              <p className="text-xs text-muted-foreground mt-6">{featured.readTime} · {featured.date}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Posts grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.id} to={`/journal/${post.id}`} className="block group">
              <div className="liquid-glass-card rounded-xl overflow-hidden hover:scale-[1.01] transition-transform duration-300 h-full flex flex-col">
                {/* Image placeholder */}
                <div className="liquid-glass aspect-video flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Text */}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{post.category}</p>
                  <h3
                    className="text-lg text-foreground font-normal leading-snug mb-2 group-hover:text-foreground/80 transition-colors flex-1"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-4">{post.readTime} · {post.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter strip */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="liquid-glass-card rounded-2xl py-12 px-8 text-center">
          <h2
            className="text-2xl sm:text-3xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Get one honest email a week.
          </h2>
          <p className="text-muted-foreground mt-3 text-sm max-w-sm mx-auto">
            No roundups, no sponsorships. Just one thing worth thinking about.
          </p>
          {subscribed ? (
            <p className="mt-8 text-foreground text-sm">You're in. Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="liquid-glass rounded-full flex-1 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              />
              <button
                type="submit"
                className="liquid-glass rounded-full px-6 py-3 text-sm text-foreground hover:scale-[1.03] transition-transform shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
