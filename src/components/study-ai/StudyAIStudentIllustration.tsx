import { motion } from 'framer-motion';

export function StudyAIStudentIllustration() {
  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none w-full max-w-[460px] max-h-[520px] mx-auto">
      {/* Background glow behind illustration (z-0) */}
      <div
        className="absolute inset-0 m-auto w-72 h-72 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(92,225,230,0.12) 0%, rgba(124,131,253,0.08) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Floating illustration (z-5) */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-[5] w-full flex justify-center"
      >
        <img
          src="/assets/pinterest/actual-pin-682858362229488216-poster.webp"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/study-ai-student.png";
          }}
          alt="Student studying with AI assistant hologram"
          className="w-full max-w-[440px] h-auto object-contain rounded-2xl"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(92,225,230,0.2)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
            background: 'transparent',
          }}
        />
      </motion.div>
    </div>
  );
}
