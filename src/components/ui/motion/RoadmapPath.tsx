import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface RoadmapNode {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  active: boolean;
}

interface RoadmapPathProps {
  nodes: RoadmapNode[];
  progressPercent?: number; // 0 to 100
  className?: string;
  onNodeClick?: (node: RoadmapNode) => void;
}

export const RoadmapPath: React.FC<RoadmapPathProps> = ({
  nodes,
  progressPercent = 45,
  className = '',
  onNodeClick,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${length}`;
    pathRef.current.style.strokeDashoffset = `${length * (1 - progressPercent / 100)}`;
  }, [progressPercent]);

  return (
    <div className={`relative w-full max-w-4xl mx-auto py-8 ${className}`}>
      {/* SVG Connecting Path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 800 200"
      >
        {/* Background Track Path */}
        <path
          d="M 50 100 C 200 20, 300 180, 450 100 C 600 20, 700 180, 750 100"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Animated Progress Path */}
        <motion.path
          ref={pathRef}
          d="M 50 100 C 200 20, 300 180, 450 100 C 600 20, 700 180, 750 100"
          fill="none"
          stroke="url(#roadmapGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={shouldReduceMotion ? {} : { strokeDashoffset: 1000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <defs>
          <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#287BFF" />
            <stop offset="50%" stopColor="#5CE1E6" />
            <stop offset="100%" stopColor="#6F7CFF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Node Landmarks */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center justify-between">
        {nodes.map((node, index) => {
          const isDone = node.completed;
          const isActive = node.active;

          return (
            <motion.div
              key={node.id}
              onClick={() => onNodeClick?.(node)}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              {/* Circular Node Pulse */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${
                  isDone
                    ? 'bg-[#287BFF] text-white shadow-[#287BFF]/30 border-2 border-white'
                    : isActive
                    ? 'bg-[#5CE1E6] text-[#062B3D] ring-4 ring-[#5CE1E6]/30 animate-pulse border-2 border-white'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </div>

              <div className="mt-3">
                <p
                  className={`text-xs font-bold transition-colors ${
                    isDone || isActive ? 'text-[#062B3D]' : 'text-slate-500'
                  }`}
                >
                  {node.title}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">{node.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
