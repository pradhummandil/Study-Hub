import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { Navbar } from './components/Navbar';
import { SocialProofBar } from './components/SocialProofBar';
import { ExitIntentModal } from './components/ExitIntentModal';
import { FloatingAIButton } from './components/study-ai/FloatingAIButton';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CustomCursor } from './components/ui/motion/CustomCursor';
import { ScrollStorySection } from './components/homepage/ScrollStorySection';

// Lazy-loaded pages
const ReachUs   = lazy(() => import('./pages/ReachUs'));
const Studio    = lazy(() => import('./pages/Studio'));
const FocusRoom = lazy(() => import('./pages/FocusRoom'));
const About     = lazy(() => import('./pages/About'));
const Journal   = lazy(() => import('./pages/Journal'));
const JournalArticlePage = lazy(() => import('./pages/JournalArticlePage'));
const Community = lazy(() => import('./pages/Community'));
const SignUp    = lazy(() => import('./pages/SignUp'));
const Login     = lazy(() => import('./pages/Login'));
const Profile   = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound       = lazy(() => import('./pages/NotFound'));
const StudyAI        = lazy(() => import('./pages/StudyAI'));
const ExamSetup      = lazy(() => import('./pages/ExamSetup'));
const Roadmap        = lazy(() => import('./pages/Roadmap'));
const TopicRoadmap   = lazy(() => import('./pages/TopicRoadmap'));
const Practice       = lazy(() => import('./pages/Practice'));
const PracticeSession = lazy(() => import('./pages/PracticeSession'));
const MockTests      = lazy(() => import('./pages/MockTests'));
const MockTestPlayer = lazy(() => import('./pages/MockTestPlayer'));
const MockResult     = lazy(() => import('./pages/MockResult'));
const Performance    = lazy(() => import('./pages/Performance'));
const Mistakes       = lazy(() => import('./pages/Mistakes'));
const Revision       = lazy(() => import('./pages/Revision'));
const Flashcards     = lazy(() => import('./pages/Flashcards'));
const AdaptivePractice = lazy(() => import('./pages/AdaptivePractice'));
const Insights       = lazy(() => import('./pages/Insights'));
const ExamReadiness  = lazy(() => import('./pages/ExamReadiness'));
const Leaderboards   = lazy(() => import('./pages/Leaderboards'));
const Settings       = lazy(() => import('./pages/Settings'));
const ResourcePage   = lazy(() => import('./pages/ResourcePage'));
const ExamExplorer   = lazy(() => import('./pages/ExamExplorer'));
const ExamDetailPage = lazy(() => import('./pages/ExamDetailPage'));
const DevPinterestVerification = lazy(() => import('./pages/DevPinterestVerification'));
const DevAnimationVerification = lazy(() => import('./pages/DevAnimationVerification'));
const DevMotionCatalog = lazy(() => import('./pages/DevMotionCatalog'));
const DevDesignSystem = lazy(() => import('./pages/DevDesignSystem'));
import { StudyHubStartupAnimation } from './components/animations/StudyHubStartupAnimation';
import { PageTransitionAnimation } from './components/animations/PageTransitionAnimation';

// Phase 5 Pages
const Pricing             = lazy(() => import('./pages/Pricing'));
const Referrals           = lazy(() => import('./pages/Referrals'));
const ExamSimulatorPage   = lazy(() => import('./pages/ExamSimulatorPage'));
const ExamSimulatorPlayer = lazy(() => import('./pages/ExamSimulatorPlayer'));
const ExamSimulatorResult = lazy(() => import('./pages/ExamSimulatorResult'));
const ExamSimulatorReview = lazy(() => import('./pages/ExamSimulatorReview'));
const ExamSimulatorHistory = lazy(() => import('./pages/ExamSimulatorHistory'));
const PracticeHistory     = lazy(() => import('./pages/PracticeHistory'));
const QuestionDetail      = lazy(() => import('./pages/QuestionDetail'));
const MentorPortal        = lazy(() => import('./pages/MentorPortal'));
const InstitutionPortal   = lazy(() => import('./pages/InstitutionPortal'));

// Admin pages
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminResources    = lazy(() => import('./pages/admin/AdminResources'));
const AdminQuestions    = lazy(() => import('./pages/admin/AdminQuestions'));
const AdminExams        = lazy(() => import('./pages/admin/AdminExams'));
const AdminRoadmaps     = lazy(() => import('./pages/admin/AdminRoadmaps'));
const AdminMockTests    = lazy(() => import('./pages/admin/AdminMockTests'));
const AdminReports      = lazy(() => import('./pages/admin/AdminReports'));
const AdminStudyAI      = lazy(() => import('./pages/admin/AdminStudyAI'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminAnalytics    = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSystemHealth = lazy(() => import('./pages/admin/AdminSystemHealth'));
const AdminAuditLog     = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminAiQuality    = lazy(() => import('./pages/admin/AdminAiQuality'));
const AdminVideoLearning = lazy(() => import('./pages/admin/AdminVideoLearning'));

// Video Learning Pages
const VideoLearningPage = lazy(() => import('./pages/video-learning/VideoLearningPage'));
const VideoPlaylistPage = lazy(() => import('./pages/video-learning/VideoPlaylistPage'));
const VideoTopicPage    = lazy(() => import('./pages/video-learning/VideoTopicPage'));
const VideoChannelPage  = lazy(() => import('./pages/video-learning/VideoChannelPage'));
const VideoShortsPage   = lazy(() => import('./pages/video-learning/VideoShortsPage'));
const VideoHistoryPage  = lazy(() => import('./pages/video-learning/VideoHistoryPage'));
const VideoSavedPage    = lazy(() => import('./pages/video-learning/VideoSavedPage'));
const VideoCollectionPage = lazy(() => import('./pages/video-learning/VideoCollectionPage'));
const VideoWatchPage    = lazy(() => import('./pages/video-learning/VideoWatchPage'));

// Pulsing dot fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
    <p className="text-xs text-muted-foreground">Study Hub — Preparing your study space...</p>
  </div>
);

// Admin loader
const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#062B3D]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-[#5CE1E6] border-t-transparent animate-spin" />
      <p className="text-[#5CE1E6] text-sm">Loading admin console...</p>
    </div>
  </div>
);

import { Helmet } from 'react-helmet-async';
import { useAuth } from './context/AuthContext';
import { HeroSectionV2 } from './components/homepage/HeroSectionV2';
import { PersonalizedUserHero } from './components/homepage/PersonalizedUserHero';
import { InteractiveProductDemo } from './components/homepage/InteractiveProductDemo';
import { StudyMateShowcase } from './components/homepage/StudyMateShowcase';
import { ExamExplorerGrid } from './components/homepage/ExamExplorerGrid';
import { ProductFeatureSections } from './components/homepage/ProductFeatureSections';
import { VideoLearningPreviewSection } from './components/homepage/VideoLearningPreviewSection';

// Home page
function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Study Hub — Your Intelligent Study Space</title>
        <meta
          name="description"
          content="Study Hub brings AI guidance, previous papers, practice, revision, mock tests and focused study into one personalized learning platform."
        />
      </Helmet>

      <Navbar />

      {user ? (
        <>
          <PersonalizedUserHero />
          <ScrollStorySection />
          <VideoLearningPreviewSection />
          <ProductFeatureSections />
        </>
      ) : (
        <>
          <HeroSectionV2 />
          <ScrollStorySection />
          <InteractiveProductDemo />
          <VideoLearningPreviewSection />
          <StudyMateShowcase />
          <ExamExplorerGrid />
          <ProductFeatureSections />
        </>
      )}

      <Footer />
    </>
  );
}

// Layout wrapper
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background pb-16 md:pb-0 flex flex-col justify-between">
      <div>
        <Navbar />
        <SocialProofBar />
        <ErrorBoundary name="page">
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}

function FloatingAIButtonWrapper() {
  const location = useLocation();
  const hide = location.pathname === '/study-ai' || location.pathname.startsWith('/admin');
  return <FloatingAIButton show={!hide} />;
}

function MobileNavWrapper() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <MobileNav />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/reach-us" element={<PageLayout><ReachUs /></PageLayout>} />
      <Route path="/studio"   element={<PageLayout><Studio /></PageLayout>} />
      <Route path="/focus-room" element={<PageLayout><FocusRoom /></PageLayout>} />
      <Route path="/about"    element={<PageLayout><About /></PageLayout>} />
      <Route path="/journal"  element={<PageLayout><Journal /></PageLayout>} />
      <Route path="/journal/:slug" element={<PageLayout><JournalArticlePage /></PageLayout>} />
      <Route path="/community" element={<PageLayout><Community /></PageLayout>} />
      <Route path="/pricing" element={<PageLayout><Pricing /></PageLayout>} />
      <Route path="/referrals" element={<PageLayout><Referrals /></PageLayout>} />
      <Route path="/mentor" element={<PageLayout><MentorPortal /></PageLayout>} />
      <Route path="/institution" element={<PageLayout><InstitutionPortal /></PageLayout>} />
      <Route path="/resource/:slug" element={<PageLayout><ResourcePage /></PageLayout>} />
      <Route path="/dev/pinterest-assets" element={<DevPinterestVerification />} />
      <Route path="/dev/animations" element={<Suspense fallback={<PageLoader />}><DevAnimationVerification /></Suspense>} />
      <Route path="/dev/motion" element={<Suspense fallback={<PageLoader />}><DevMotionCatalog /></Suspense>} />
      <Route path="/dev/design-system" element={<Suspense fallback={<PageLoader />}><DevDesignSystem /></Suspense>} />

      {/* Public Exam Catalog & Detail pages */}
      <Route path="/exams" element={<PageLayout><ExamExplorer /></PageLayout>} />
      <Route path="/exams/:slug" element={<PageLayout><ExamDetailPage /></PageLayout>} />

      {/* Video Learning Hub Routes */}
      <Route path="/video-learning" element={<PageLayout><VideoLearningPage /></PageLayout>} />
      <Route path="/video-learning/playlist/:playlistId" element={<PageLayout><VideoPlaylistPage /></PageLayout>} />
      <Route path="/video-learning/topic/:slug" element={<PageLayout><VideoTopicPage /></PageLayout>} />
      <Route path="/video-learning/channel/:channelId" element={<PageLayout><VideoChannelPage /></PageLayout>} />
      <Route path="/video-learning/shorts" element={<VideoShortsPage />} />
      <Route path="/video-learning/history" element={<PageLayout><VideoHistoryPage /></PageLayout>} />
      <Route path="/video-learning/saved" element={<PageLayout><VideoSavedPage /></PageLayout>} />
      <Route path="/video-learning/collection/:slug" element={<PageLayout><VideoCollectionPage /></PageLayout>} />
      <Route path="/video-learning/video/:videoId" element={<VideoWatchPage />} />

      {/* Auth Routes */}
      <Route path="/signup" element={<Suspense fallback={<PageLoader />}><SignUp /></Suspense>} />
      <Route path="/login"  element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />

      {/* Auth-Gated Personalized Student Routes */}
      <Route path="/dashboard" element={<RequireAuth><PageLayout><Dashboard /></PageLayout></RequireAuth>} />
      <Route path="/setup"     element={<RequireAuth><PageLayout><ExamSetup /></PageLayout></RequireAuth>} />
      <Route path="/roadmap"   element={<RequireAuth><PageLayout><Roadmap /></PageLayout></RequireAuth>} />
      <Route path="/roadmap/:topicId" element={<RequireAuth><PageLayout><TopicRoadmap /></PageLayout></RequireAuth>} />
      <Route path="/practice"  element={<RequireAuth><PageLayout><Practice /></PageLayout></RequireAuth>} />
      <Route path="/practice/history" element={<RequireAuth><PageLayout><PracticeHistory /></PageLayout></RequireAuth>} />
      <Route path="/practice/session/:id" element={<RequireAuth><PageLayout><PracticeSession /></PageLayout></RequireAuth>} />
      <Route path="/question/:questionId" element={<RequireAuth><PageLayout><QuestionDetail /></PageLayout></RequireAuth>} />
      <Route path="/mock-tests" element={<RequireAuth><PageLayout><MockTests /></PageLayout></RequireAuth>} />
      <Route path="/mock-tests/:id" element={<RequireAuth><Suspense fallback={<PageLoader />}><ErrorBoundary name="Mock Test"><MockTestPlayer /></ErrorBoundary></Suspense></RequireAuth>} />
      <Route path="/mock-tests/:id/result" element={<RequireAuth><PageLayout><MockResult /></PageLayout></RequireAuth>} />
      <Route path="/performance" element={<RequireAuth><PageLayout><Performance /></PageLayout></RequireAuth>} />
      <Route path="/mistakes" element={<RequireAuth><PageLayout><Mistakes /></PageLayout></RequireAuth>} />
      <Route path="/revision" element={<RequireAuth><PageLayout><Revision /></PageLayout></RequireAuth>} />
      <Route path="/flashcards" element={<RequireAuth><PageLayout><Flashcards /></PageLayout></RequireAuth>} />
      <Route path="/adaptive-practice" element={<RequireAuth><PageLayout><AdaptivePractice /></PageLayout></RequireAuth>} />
      <Route path="/insights" element={<RequireAuth><PageLayout><Insights /></PageLayout></RequireAuth>} />
      <Route path="/exam-readiness" element={<RequireAuth><PageLayout><ExamReadiness /></PageLayout></RequireAuth>} />
      <Route path="/leaderboards" element={<RequireAuth><PageLayout><Leaderboards /></PageLayout></RequireAuth>} />
      <Route path="/profile"  element={<RequireAuth><PageLayout><Profile /></PageLayout></RequireAuth>} />
      <Route path="/account"  element={<RequireAuth><PageLayout><Profile /></PageLayout></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><PageLayout><Settings /></PageLayout></RequireAuth>} />
      
      <Route path="/exam-simulator" element={<RequireAuth><PageLayout><ExamSimulatorPage /></PageLayout></RequireAuth>} />
      <Route path="/exam-simulator/history" element={<RequireAuth><PageLayout><ExamSimulatorHistory /></PageLayout></RequireAuth>} />
      <Route path="/exam-simulator/runner/:id" element={<RequireAuth><Suspense fallback={<PageLoader />}><ErrorBoundary name="Exam Simulator Runner"><ExamSimulatorPlayer /></ErrorBoundary></Suspense></RequireAuth>} />
      <Route path="/exam-simulator/result/:id" element={<RequireAuth><PageLayout><ExamSimulatorResult /></PageLayout></RequireAuth>} />
      <Route path="/exam-simulator/review/:id" element={<RequireAuth><PageLayout><ExamSimulatorReview /></PageLayout></RequireAuth>} />

      {/* StudyMate AI */}
      <Route path="/study-ai" element={<RequireAuth><Suspense fallback={<PageLoader />}><ErrorBoundary name="StudyMate AI"><StudyAI /></ErrorBoundary></Suspense></RequireAuth>} />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminLoader />}>
            <ErrorBoundary name="Admin">
              <AdminLayout />
            </ErrorBoundary>
          </Suspense>
        }
      >
        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
        <Route path="video-learning" element={<Suspense fallback={<PageLoader />}><AdminVideoLearning /></Suspense>} />
        <Route path="resources" element={<Suspense fallback={<PageLoader />}><AdminResources /></Suspense>} />
        <Route path="resources/health" element={<Suspense fallback={<PageLoader />}><AdminResources /></Suspense>} />
        <Route path="questions" element={<Suspense fallback={<PageLoader />}><AdminQuestions /></Suspense>} />
        <Route path="exams" element={<Suspense fallback={<PageLoader />}><AdminExams /></Suspense>} />
        <Route path="roadmaps" element={<Suspense fallback={<PageLoader />}><AdminRoadmaps /></Suspense>} />
        <Route path="mock-tests" element={<Suspense fallback={<PageLoader />}><AdminMockTests /></Suspense>} />
        <Route path="community" element={<Suspense fallback={<PageLoader />}><AdminReports /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<PageLoader />}><AdminReports /></Suspense>} />
        <Route path="study-ai" element={<Suspense fallback={<PageLoader />}><AdminStudyAI /></Suspense>} />
        <Route path="ai-quality" element={<Suspense fallback={<PageLoader />}><AdminAiQuality /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<PageLoader />}><AdminAnnouncements /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense>} />
        <Route path="system" element={<Suspense fallback={<PageLoader />}><AdminSystemHealth /></Suspense>} />
        <Route path="audit-log" element={<Suspense fallback={<PageLoader />}><AdminAuditLog /></Suspense>} />
      </Route>

      <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <StudentProvider>
          <BrowserRouter>
            <CustomCursor />
            <StudyHubStartupAnimation />
            <PageTransitionAnimation />
            <AppRoutes />
            <FloatingAIButtonWrapper />
            <ExitIntentModal />
            <MobileNavWrapper />
          </BrowserRouter>
        </StudentProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
