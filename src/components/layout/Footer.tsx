import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200/80 bg-white pt-16 pb-12 px-6 text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <Logo size="md" />
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
            Your personalized learning platform for GATE, JEE, NEET, CUET & university exams. All your practice, revision, mock tests and AI guidance in one place.
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            © {new Date().getFullYear()} Study Hub. All rights reserved.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-bold text-[#062B3D]">Product</p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li><Link to="/study-ai" className="hover:text-[#287BFF] transition-colors">StudyMate AI</Link></li>
            <li><Link to="/studio" className="hover:text-[#287BFF] transition-colors">Studio</Link></li>
            <li><Link to="/roadmap" className="hover:text-[#287BFF] transition-colors">Roadmap</Link></li>
            <li><Link to="/practice" className="hover:text-[#287BFF] transition-colors">Practice</Link></li>
            <li><Link to="/mock-tests" className="hover:text-[#287BFF] transition-colors">Mock Tests</Link></li>
          </ul>
        </div>

        {/* Explore Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-bold text-[#062B3D]">Explore</p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li><Link to="/exams" className="hover:text-[#287BFF] transition-colors">Exams</Link></li>
            <li><Link to="/journal" className="hover:text-[#287BFF] transition-colors">Journal</Link></li>
            <li><Link to="/community" className="hover:text-[#287BFF] transition-colors">Community</Link></li>
            <li><Link to="/focus-room" className="hover:text-[#287BFF] transition-colors">Focus Room</Link></li>
            <li><Link to="/revision" className="hover:text-[#287BFF] transition-colors">Revision</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-bold text-[#062B3D]">Company</p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li><Link to="/about" className="hover:text-[#287BFF] transition-colors">About</Link></li>
            <li><Link to="/reach-us" className="hover:text-[#287BFF] transition-colors">Reach Us</Link></li>
            <li><Link to="/pricing" className="hover:text-[#287BFF] transition-colors">Pricing</Link></li>
            <li><Link to="/referrals" className="hover:text-[#287BFF] transition-colors">Referrals</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
