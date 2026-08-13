import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="relative z-10 bg-forest text-paper pt-16 pb-12 px-6 border-t border-forest/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <Logo size="md" />
          <p className="text-xs text-sage leading-relaxed max-w-sm">
            Your personalized learning space for GATE, JEE, NEET, CUET & university exams. Practice, revision, mock tests, and AI guidance in one synchronized platform.
          </p>
          <p className="text-[11px] text-muted font-mono">
            © {new Date().getFullYear()} Study Hub. All rights reserved.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-gold">Product</p>
          <ul className="space-y-2 text-xs text-sage">
            <li><Link to="/video-learning" className="hover:text-paper transition-colors">Video Learning 3.0</Link></li>
            <li><Link to="/study-ai" className="hover:text-paper transition-colors">StudyMate AI</Link></li>
            <li><Link to="/studio" className="hover:text-paper transition-colors">Studio</Link></li>
            <li><Link to="/roadmap" className="hover:text-paper transition-colors">Roadmap</Link></li>
            <li><Link to="/practice" className="hover:text-paper transition-colors">Practice</Link></li>
            <li><Link to="/mock-tests" className="hover:text-paper transition-colors">Mock Tests</Link></li>
          </ul>
        </div>

        {/* Explore Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-gold">Explore</p>
          <ul className="space-y-2 text-xs text-sage">
            <li><Link to="/exams" className="hover:text-paper transition-colors">Exams</Link></li>
            <li><Link to="/journal" className="hover:text-paper transition-colors">Journal</Link></li>
            <li><Link to="/community" className="hover:text-paper transition-colors">Community</Link></li>
            <li><Link to="/focus-room" className="hover:text-paper transition-colors">Focus Room</Link></li>
            <li><Link to="/revision" className="hover:text-paper transition-colors">Revision</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-gold">Company</p>
          <ul className="space-y-2 text-xs text-sage">
            <li><Link to="/about" className="hover:text-paper transition-colors">About Us</Link></li>
            <li><Link to="/reach-us" className="hover:text-paper transition-colors">Reach Us</Link></li>
            <li><Link to="/pricing" className="hover:text-paper transition-colors">Pricing</Link></li>
            <li><Link to="/referrals" className="hover:text-paper transition-colors">Referrals</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
