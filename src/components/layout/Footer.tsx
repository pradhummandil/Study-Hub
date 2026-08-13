import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-background pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <Logo size="md" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your personal student operating system for GATE, JEE, NEET & CUET aspirants.
          </p>
          <p className="text-[11px] text-muted-foreground/60 font-mono">
            © {new Date().getFullYear()} Study Hub. All rights reserved.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-foreground">Product</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/study-ai" className="hover:text-foreground transition-colors">StudyMate AI</Link></li>
            <li><Link to="/studio" className="hover:text-foreground transition-colors">Resource Studio</Link></li>
            <li><Link to="/roadmap" className="hover:text-foreground transition-colors">Personalized Roadmap</Link></li>
            <li><Link to="/practice" className="hover:text-foreground transition-colors">Practice & PYQs</Link></li>
            <li><Link to="/mock-tests" className="hover:text-foreground transition-colors">Mock Test Engine</Link></li>
            <li><Link to="/exam-simulator" className="hover:text-foreground transition-colors">Exam Simulator</Link></li>
          </ul>
        </div>

        {/* Community & Editorial */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-foreground">Community & Editorial</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/community" className="hover:text-foreground transition-colors">Study Circles</Link></li>
            <li><Link to="/journal" className="hover:text-foreground transition-colors">The Study Hub Journal</Link></li>
            <li><Link to="/focus-room" className="hover:text-foreground transition-colors">Focus Room</Link></li>
            <li><Link to="/revision" className="hover:text-foreground transition-colors">Spaced Revision</Link></li>
          </ul>
        </div>

        {/* Company & Support */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-foreground">Company & Support</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground transition-colors">About Study Hub</Link></li>
            <li><Link to="/reach-us" className="hover:text-foreground transition-colors">Reach Us & Book Call</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Plans & Pricing</Link></li>
            <li><Link to="/referrals" className="hover:text-foreground transition-colors">Student Referral</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
