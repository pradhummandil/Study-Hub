import { motion } from 'framer-motion';

interface StudyAIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showSparkle?: boolean;
}

const sizeMap = {
  sm: { outer: 32 },
  md: { outer: 44 },
  lg: { outer: 64 },
};

export function StudyAIAvatar({ size = 'md', showSparkle = false }: StudyAIAvatarProps) {
  const { outer } = sizeMap[size];

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: outer, height: outer }}>
      {/* Outer ambient glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(92,225,230,0.4), rgba(124,131,253,0.4), rgba(180,156,255,0.4))',
          filter: 'blur(5px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main video orb container — plays /video/chatbot.mp4 in exact circular shape */}
      <div
        className="relative rounded-full overflow-hidden z-10 border border-[#5CE1E6]/40 flex items-center justify-center bg-[#062B3D]"
        style={{
          width: outer,
          height: outer,
          boxShadow: '0 0 16px rgba(92,225,230,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
        }}
      >
        <video
          src="/video/chatbot.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-full pointer-events-none select-none"
        />
      </div>

      {/* Sparkle active badge */}
      {showSparkle && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#5CE1E6] z-20"
          style={{ boxShadow: '0 0 8px #5CE1E6' }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
