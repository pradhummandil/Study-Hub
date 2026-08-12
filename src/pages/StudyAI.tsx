import { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Sparkles, CloudUpload } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import type { Message, ExamType, StudyMode, QuizQuestion, QuizResult, ChatSession } from '../types/study-ai';
import { sendStudyMessage, generateMessageId } from '../lib/studyAi';
import { useAuth } from '../context/AuthContext';

import { StudyAIHeader } from '../components/study-ai/StudyAIHeader';
import { StudyAIWelcome } from '../components/study-ai/StudyAIWelcome';
import { StudyAIChat } from '../components/study-ai/StudyAIChat';
import { StudyAIComposer } from '../components/study-ai/StudyAIComposer';
import { StudyAIQuickActions } from '../components/study-ai/StudyAIQuickActions';
import { StudyAIQuiz } from '../components/study-ai/StudyAIQuiz';
import { StudyAIQuizResult } from '../components/study-ai/StudyAIQuizResult';
import { StudyAISidebar } from '../components/study-ai/StudyAISidebar';
import { StudyAIExamSelector } from '../components/study-ai/StudyAIExamSelector';

import {
  generateChatTitle,
  dbFetchUserChats,
  dbFetchChatMessages,
  dbCreateChat,
  dbSaveMessage,
  dbRenameChat,
  dbDeleteChat,
  dbClearAllChats,
  localGetChats,
  localSaveChats,
  localGetMessages,
  localSaveMessages,
  localDeleteChat,
  localClearAll,
  migrateLocalChatsToAccount,
} from '../lib/studyAiStorage';

// ── Quiz parsing helper ────────────────────────────────────────────────────
function tryParseQuizFromResponse(text: string): QuizQuestion[] | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[1]);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
      return parsed as QuizQuestion[];
    }
  } catch {
    return null;
  }
  return null;
}

function computeQuizResult(
  questions: QuizQuestion[],
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>
): QuizResult {
  let score = 0;
  const strongTopics: string[] = [];
  const weakTopics: string[] = [];

  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) {
      score++;
      if (q.topic && !strongTopics.includes(q.topic)) strongTopics.push(q.topic);
    } else {
      if (q.topic && !weakTopics.includes(q.topic)) weakTopics.push(q.topic);
    }
  });

  const total = questions.length;
  const accuracy = Math.round((score / total) * 100);

  let recommendation = '';
  if (accuracy < 60 && weakTopics.length > 0) {
    recommendation = `Focus on revising ${weakTopics.slice(0, 2).join(' and ')}. Try the Revision mode for a quick refresh, then reattempt this quiz.`;
  } else if (accuracy >= 80) {
    recommendation = `Great job! Move to harder questions or try a different topic to keep challenging yourself.`;
  } else {
    recommendation = `You're on the right track. Review the explanations above and try practicing ${weakTopics[0] || 'these topics'} more.`;
  }

  return { score, total, accuracy, strongTopics, weakTopics, recommendation };
}

export default function StudyAI() {
  const { user } = useAuth();
  const userId = user?.id || null;
  const isAuthenticated = !!userId;

  const [searchParams, setSearchParams] = useSearchParams();
  const urlChatId = searchParams.get('chat');

  // Sidebar & Sessions state
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(urlChatId);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);

  // Core chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const pendingUserMessage = useRef<Message | null>(null);

  // Context
  const [selectedExam, setSelectedExam] = useState<ExamType>('General');
  const [selectedMode, setSelectedMode] = useState<StudyMode>('Explain');

  // Quiz state
  const [quizState, setQuizState] = useState<{
    active: boolean;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
    revealed: Record<number, boolean>;
    completed: boolean;
    result: QuizResult | null;
    config: null;
  }>({
    active: false,
    questions: [],
    currentIndex: 0,
    answers: {},
    revealed: {},
    completed: false,
    result: null,
    config: null,
  });

  // ── Load Chats List ────────────────────────────────────────────────────────
  const loadChatsList = useCallback(async () => {
    if (userId) {
      const userChats = await dbFetchUserChats(userId);
      setChats(userChats);

      // Check if local unauthenticated chats exist for migration
      const localChats = localGetChats();
      if (localChats.length > 0) {
        setShowMigrationBanner(true);
      }
    } else {
      const localChats = localGetChats();
      setChats(localChats);
    }
  }, [userId]);

  useEffect(() => {
    loadChatsList();
  }, [loadChatsList]);

  // ── Load Messages for Active Chat ──────────────────────────────────────────
  const loadChatMessages = useCallback(
    async (chatId: string) => {
      let chatMsgs: Message[] = [];
      if (userId) {
        chatMsgs = await dbFetchChatMessages(chatId, userId);
      } else {
        chatMsgs = localGetMessages(chatId);
      }
      setMessages(chatMsgs);

      // Find session to restore exam/mode
      const session = chats.find((c) => c.id === chatId);
      if (session) {
        if (session.exam) setSelectedExam(session.exam);
        if (session.mode) setSelectedMode(session.mode);
      }
    },
    [userId, chats]
  );

  useEffect(() => {
    if (urlChatId) {
      setActiveChatId(urlChatId);
      loadChatMessages(urlChatId);
    } else {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [urlChatId, loadChatMessages]);

  // ── Sync URL when Chat Changes ─────────────────────────────────────────────
  const selectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      setSearchParams({ chat: chatId });
      loadChatMessages(chatId);
    },
    [setSearchParams, loadChatMessages]
  );

  const startNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setSearchParams({});
    setQuizState({
      active: false,
      questions: [],
      currentIndex: 0,
      answers: {},
      revealed: {},
      completed: false,
      result: null,
      config: null,
    });
  }, [setSearchParams]);

  // ── Migration Handler ──────────────────────────────────────────────────────
  const handleMigrateChats = async () => {
    if (!userId) return;
    await migrateLocalChatsToAccount(userId);
    setShowMigrationBanner(false);
    await loadChatsList();
  };

  // ── Send / Retry Message Flow ──────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, isRetry: boolean = false) => {
      if (isLoading) return;

      setIsLoading(true);
      setIsThinking(true);
      setRateLimited(false);

      try {
        let chatId = activeChatId;
        let currentSession: ChatSession | null = null;

        // 1. Create chat if doesn't exist
        if (!chatId) {
          const title = generateChatTitle(content, selectedExam);
          if (userId) {
            currentSession = await dbCreateChat({
              userId,
              title,
              exam: selectedExam,
              mode: selectedMode,
            });
            if (currentSession) chatId = currentSession.id;
          } else {
            chatId = `local_${Date.now()}`;
            currentSession = {
              id: chatId,
              title,
              exam: selectedExam,
              mode: selectedMode,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const existing = localGetChats();
            localSaveChats([currentSession, ...existing]);
          }

          if (chatId) {
            setActiveChatId(chatId);
            setSearchParams({ chat: chatId });
            setChats((prev) => (currentSession ? [currentSession, ...prev] : prev));
          }
        }

        if (!chatId) return;

        // 2. Prepare user message & Save immediately BEFORE calling Gemini
        let userMsg: Message;
        if (isRetry && pendingUserMessage.current) {
          userMsg = pendingUserMessage.current;
        } else {
          userMsg = {
            id: generateMessageId(),
            role: 'user',
            content,
            timestamp: new Date(),
            status: 'complete',
          };
          pendingUserMessage.current = userMsg;

          if (userId) {
            await dbSaveMessage({
              chatId,
              userId,
              role: 'user',
              content,
              status: 'complete',
            });
          }

          setMessages((prev) => {
            const updated = [...prev.filter((m) => !m.isError && m.status !== 'error'), userMsg];
            if (!userId) localSaveMessages(chatId!, updated);
            return updated;
          });
        }

        // 3. Call Gemini API
        const context = {
          exam: selectedExam,
          mode: selectedMode,
        };

        // Build complete history payload
        const historyPayload = messages
          .filter((m) => !m.isError && m.status !== 'error')
          .concat(userMsg);

        const response = await sendStudyMessage(
          historyPayload,
          context,
          isAuthenticated
        );

        if (response.rateLimited) {
          setRateLimited(true);
          return;
        }

        if (response.error || !response.response) {
          setIsConnected(false);
          const errorText =
            response.error ||
            "I couldn't generate an answer right now. Your question is safely saved. Please try again.";

          const errorAssistantMsg: Message = {
            id: generateMessageId(),
            role: 'assistant',
            content: errorText,
            timestamp: new Date(),
            status: 'error',
            isError: true,
          };

          if (userId) {
            await dbSaveMessage({
              chatId,
              userId,
              role: 'assistant',
              content: errorText,
              status: 'error',
            });
          }

          setMessages((prev) => {
            const updated = [...prev, errorAssistantMsg];
            if (!userId) localSaveMessages(chatId!, updated);
            return updated;
          });
          return;
        }

        setIsConnected(true);

        // Check if response contains quiz JSON
        const quizQuestions = tryParseQuizFromResponse(response.response);
        const assistantContent = quizQuestions
          ? "📝 Here's your quiz! Answer each question and I'll explain the answer after you choose."
          : response.response;

        const assistantMsg: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          status: 'complete',
        };

        if (userId) {
          await dbSaveMessage({
            chatId,
            userId,
            role: 'assistant',
            content: assistantContent,
            status: 'complete',
          });
        }

        setMessages((prev) => {
          const updated = [...prev, assistantMsg];
          if (!userId) localSaveMessages(chatId!, updated);
          return updated;
        });

        if (quizQuestions && quizQuestions.length > 0) {
          const questionsWithIds = quizQuestions.map((q, i) => ({
            ...q,
            id: `q_${Date.now()}_${i}`,
          }));

          setQuizState({
            active: true,
            questions: questionsWithIds,
            currentIndex: 0,
            answers: {},
            revealed: {},
            completed: false,
            result: null,
            config: null,
          });
        }
      } catch (err) {
        console.error('sendMessage unexpected error:', err);
        setIsConnected(false);
      } finally {
        // Guaranteed cleanup: ALWAYS unmount thinking indicator & reset loading
        setIsThinking(false);
        setIsLoading(false);
      }
    },
    [activeChatId, isLoading, messages, selectedExam, selectedMode, isAuthenticated, userId, setSearchParams]
  );

  // ── Quick action click ─────────────────────────────────────────────────────
  const handleQuickAction = useCallback(
    (prompt: string, exam?: ExamType, mode?: StudyMode) => {
      if (exam) setSelectedExam(exam);
      if (mode) setSelectedMode(mode);
      sendMessage(prompt);
    },
    [sendMessage]
  );

  // ── Retry Last Failed Question ──────────────────────────────────────────────
  const handleRetryLast = useCallback(() => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove any trailing error assistant message
      setMessages((prev) => prev.filter((m) => !m.isError && m.status !== 'error'));
      pendingUserMessage.current = lastUserMsg;
      sendMessage(lastUserMsg.content, true);
    }
  }, [messages, sendMessage]);

  // ── Rename Chat ────────────────────────────────────────────────────────────
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
    );
    if (userId) {
      await dbRenameChat(chatId, userId, newTitle);
    } else {
      const chats = localGetChats();
      localSaveChats(
        chats.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
      );
    }
  };

  // ── Delete Single Chat ─────────────────────────────────────────────────────
  const handleDeleteChat = async (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      startNewChat();
    }
    if (userId) {
      await dbDeleteChat(chatId, userId);
    } else {
      localDeleteChat(chatId);
    }
  };

  // ── Clear All Chats ────────────────────────────────────────────────────────
  const handleClearAllChats = async () => {
    setChats([]);
    startNewChat();
    if (userId) {
      await dbClearAllChats(userId);
    } else {
      localClearAll();
    }
  };

  // ── Quiz handlers ──────────────────────────────────────────────────────────
  const handleQuizAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentIndex]: answer },
      revealed: { ...prev.revealed, [prev.currentIndex]: true },
    }));
  }, []);

  const handleQuizNext = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }));
  }, []);

  const handleQuizFinish = useCallback(() => {
    setQuizState((prev) => {
      const result = computeQuizResult(prev.questions, prev.answers);
      return { ...prev, completed: true, active: false, result };
    });
  }, []);

  const handleQuizRetry = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      active: true,
      currentIndex: 0,
      answers: {},
      revealed: {},
      completed: false,
      result: null,
    }));
  }, []);

  const handlePracticeWeak = useCallback(
    (topic: string) => {
      setQuizState({
        active: false,
        questions: [],
        currentIndex: 0,
        answers: {},
        revealed: {},
        completed: false,
        result: null,
        config: null,
      });
      sendMessage(`Give me 5 practice questions focused on ${topic}. Present them one at a time with A, B, C, D options.`);
    },
    [sendMessage]
  );

  const hasMessages = messages.length > 0;

  return (
    <>
      <Helmet>
        <title>StudyMate AI — AI Study Coach | Study Hub</title>
        <meta
          name="description"
          content="StudyMate AI is your personal AI study coach. Get help with GATE, JEE, NEET, UPSC, quizzes, study plans, concept explanations, and exam preparation."
        />
      </Helmet>

      {/* Page Layout Container */}
      <div
        className="flex flex-col w-full h-screen min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #062B3D 0%, #041e2b 100%)',
        }}
      >
        {/* Ambient background glow elements (z-0) */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(92,225,230,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(124,131,253,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* ── Header Control Layer (z-100) ─────────────────────────── */}
        <StudyAIHeader
          selectedExam={selectedExam}
          selectedMode={selectedMode}
          onExamChange={setSelectedExam}
          onModeChange={setSelectedMode}
          isConnected={isConnected}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Mobile Exam/Mode Selector Bar (z-90) */}
        <div
          className="flex sm:hidden px-4 py-2 gap-2 relative z-[90]"
          style={{
            background: 'rgba(6,43,61,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <StudyAIExamSelector
            selectedExam={selectedExam}
            selectedMode={selectedMode}
            onExamChange={setSelectedExam}
            onModeChange={setSelectedMode}
          />
        </div>

        {/* Local-to-Account Migration Banner */}
        <AnimatePresence>
          {showMigrationBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mt-3 rounded-xl px-4 py-3 flex items-center justify-between gap-3 relative z-30"
              style={{
                background: 'rgba(92,225,230,0.1)',
                border: '1px solid rgba(92,225,230,0.25)',
              }}
            >
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CloudUpload className="w-4 h-4 text-[#5CE1E6] shrink-0" />
                <span>We found study conversations from this device. Save them to your account?</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowMigrationBanner(false)}
                  className="px-3 py-1 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Not now
                </button>
                <button
                  onClick={handleMigrateChats}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#5CE1E6] text-[#062B3D]"
                >
                  Save chats
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rate limit banner */}
        <AnimatePresence>
          {rateLimited && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mt-3 rounded-xl px-4 py-3 flex items-start gap-3 relative z-30"
              style={{
                background: 'rgba(255,179,138,0.08)',
                border: '1px solid rgba(255,179,138,0.2)',
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB38A' }} />
              <div className="flex-1">
                <p className="text-sm text-white/80">
                  You've reached today's free AI limit. Come back tomorrow, or continue with the{' '}
                  <Link to="/studio" className="underline" style={{ color: '#5CE1E6' }}>
                    resource library
                  </Link>{' '}
                  and{' '}
                  <Link to="/focus-room" className="underline" style={{ color: '#5CE1E6' }}>
                    Focus Room
                  </Link>.
                </p>
                {!isAuthenticated && (
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium"
                    style={{ color: '#5CE1E6' }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Sign up for a higher daily allowance
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Body Layer: Sidebar + Chat Area (z-10) ──────────── */}
        <div className="flex-1 flex overflow-hidden relative z-10">

          {/* Permanent Desktop Sidebar / Mobile Drawer */}
          <StudyAISidebar
            chats={chats}
            currentChatId={activeChatId}
            onSelectChat={selectChat}
            onNewChat={startNewChat}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onClearAllChats={handleClearAllChats}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">

            {/* Welcome state vs Chat state */}
            {!hasMessages && !isThinking ? (
              <StudyAIWelcome
                onAction={handleQuickAction}
                selectedExam={selectedExam}
              />
            ) : (
              <StudyAIChat
                messages={messages}
                isThinking={isThinking}
                onRetry={handleRetryLast}
              />
            )}

            {/* Quiz overlay */}
            <AnimatePresence>
              {quizState.active && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.35 }}
                  className="mx-4 mb-4"
                >
                  <StudyAIQuiz
                    quizState={quizState}
                    onAnswer={handleQuizAnswer}
                    onNext={handleQuizNext}
                    onFinish={handleQuizFinish}
                    config={quizState.config}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz result */}
            <AnimatePresence>
              {quizState.completed && quizState.result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.35 }}
                  className="mx-4 mb-4"
                >
                  <StudyAIQuizResult
                    result={quizState.result}
                    onRetry={handleQuizRetry}
                    onPracticeWeak={handlePracticeWeak}
                    onNewChat={startNewChat}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Chat Composer Bar (z-80) ──────────────────────────── */}
            {!rateLimited && (
              <div
                className="shrink-0 px-4 pb-4 pt-2 relative z-[80]"
                style={{
                  background: 'rgba(4,27,39,0.82)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Inline quick actions when chatting */}
                {hasMessages && !quizState.active && !quizState.completed && (
                  <div className="mb-3 overflow-x-auto pb-1 no-scrollbar">
                    <StudyAIQuickActions onAction={handleQuickAction} compact />
                  </div>
                )}

                <StudyAIComposer
                  onSend={(txt) => sendMessage(txt)}
                  disabled={isLoading || quizState.active}
                  placeholder={
                    quizState.active
                      ? 'Quiz in progress — select an option above…'
                      : selectedExam !== 'General'
                      ? `Ask anything about ${selectedExam}…`
                      : 'Ask anything about your studies…'
                  }
                />

                <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  StudyMate AI · Built for students · Focused on learning
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
