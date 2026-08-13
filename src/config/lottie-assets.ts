/**
 * Lottie Assets Configuration & License Registry
 * Central registry mapping selected vector and JSON animations to target application states.
 */

export interface LottieAssetMeta {
  id: string;
  name: string;
  category: 'education' | 'ai' | 'navigation' | 'loading' | 'study' | 'success' | 'focus' | 'decorative';
  path: string;
  license: string;
  author: string;
  purpose: string;
}

export const LOTTIE_ASSET_REGISTRY: Record<string, LottieAssetMeta> = {
  loader_primary: {
    id: 'loader_primary',
    name: 'Minimal Ring Loader',
    category: 'loading',
    path: '/assets/lottie/loading/loading.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Global page loader & fallbacks',
  },
  success_check: {
    id: 'success_check',
    name: 'Green Checkmark Pulse',
    category: 'success',
    path: '/assets/lottie/success/success.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Question solved & exam complete micro-animations',
  },
  student_study: {
    id: 'student_study',
    name: 'Student Study Focus',
    category: 'education',
    path: '/assets/lottie/education/student.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'About page & hero student study visual',
  },
  analytics_pulse: {
    id: 'analytics_pulse',
    name: 'Analytics Character',
    category: 'study',
    path: '/assets/lottie/study/analytics.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Performance dashboard & insights visualization',
  },
  champion_victory: {
    id: 'champion_victory',
    name: 'Champion Trophy',
    category: 'success',
    path: '/assets/lottie/success/champion.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Leaderboard victory & high mock test scores',
  },
  task_list: {
    id: 'task_list',
    name: 'Task Completion',
    category: 'focus',
    path: '/assets/lottie/focus/task-list.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Daily study checklist & practice history',
  },
  strategy_plan: {
    id: 'strategy_plan',
    name: 'Strategic Plan',
    category: 'education',
    path: '/assets/lottie/education/business-plan.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Exam Setup strategy & roadmap planning',
  },
  contact_us: {
    id: 'contact_us',
    name: 'Contact Support',
    category: 'navigation',
    path: '/assets/lottie/navigation/contact-us.svg',
    license: 'Lottie Simple License / Free Local Vector',
    author: 'Study Hub Design System',
    purpose: 'Reach us & feedback form header',
  },
};
