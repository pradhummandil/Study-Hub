import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Flame, Play, Pause, RotateCcw, Clock, Award, CheckCircle2 } from 'lucide-react';
import { getFocusData, logSession, type FocusData, getLocalDateStr, getYesterdayDateStr } from '../lib/focusStorage';

// Format seconds into MM:SS
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Encouragement microcopy helper
function getEncouragement(streak: number): string {
  if (streak === 0) return 'Start today — it only takes one session.';
  if (streak <= 2) return 'Good start. Show up again tomorrow.';
  if (streak <= 6) return "You're building a habit now.";
  return 'This is who you are now. Keep going.';
}

// Relative date helper
function getRelativeDateLabel(dateStr: string): string {
  const today = getLocalDateStr();
  const yesterday = getYesterdayDateStr();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const logDate = new Date(dateStr);
  const nowDate = new Date(today);
  const diffTime = Math.abs(nowDate.getTime() - logDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

const PRESET_DURATIONS = [25, 45, 60];

export default function FocusRoom() {
  const [focusData, setFocusData] = useState<FocusData>(() => getFocusData());
  const [subject, setSubject] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Timer states
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Load fresh focus data on mount
  useEffect(() => {
    setFocusData(getFocusData());
  }, []);

  // Update total duration when selection changes while idle
  useEffect(() => {
    if (status === 'idle') {
      const minutes = isCustom ? (parseInt(customInput, 10) || 25) : selectedDuration;
      setRemainingSeconds(minutes * 60);
    }
  }, [selectedDuration, isCustom, customInput, status]);

  // Request Notification permission when user initiates action
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  // Timer tick effect using Date.now() delta calculation
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          // Timer complete!
          handleComplete();
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleComplete = () => {
    setStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);

    const activeMinutes = isCustom ? (parseInt(customInput, 10) || 25) : selectedDuration;
    const updated = logSession(subject, activeMinutes);
    setFocusData(updated);

    // Toast notification
    setToastMessage(`Session logged 🔥 (+${activeMinutes} mins)`);
    setTimeout(() => setToastMessage(null), 5000);

    // Native browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Focus Session Complete! 🔥', {
          body: `Great work on "${subject || 'General Study'}"! Logged ${activeMinutes} minutes.`,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification failed:', err);
      }
    }

    // Reset timer
    setRemainingSeconds(activeMinutes * 60);
  };

  const handleStart = () => {
    requestNotificationPermission();
    const targetTime = Date.now() + remainingSeconds * 1000;
    endTimeRef.current = targetTime;
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = () => {
    setStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);
    const activeMinutes = isCustom ? (parseInt(customInput, 10) || 25) : selectedDuration;
    setRemainingSeconds(activeMinutes * 60);
  };

  // Progress percentage calculation
  const totalSeconds = (isCustom ? (parseInt(customInput, 10) || 25) : selectedDuration) * 60;
  const progressPercent = totalSeconds > 0 ? (remainingSeconds / totalSeconds) : 0;
  const strokeDashoffset = 283 * (1 - progressPercent); // 283 is circumference for r=45

  return (
    <>
      <Helmet>
        <title>Focus Room — Study Hub</title>
        <meta name="description" content="A private, distraction-free study timer and streak tracker. Build your study habit one session at a time." />
      </Helmet>

      {/* Hero Strip */}
      <div className="relative z-10 px-6 pt-24 pb-12 text-center max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Your focus, <span className="text-gradient-accent">tracked.</span>
        </h1>

        <p className="animate-fade-rise-delay text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
          No account needed — this lives in your browser. Come back daily and watch the streak grow.
        </p>
      </div>

      {/* Stats Row */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Streak */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Current Streak</span>
                <Flame
                  className={`w-5 h-5 ${
                    focusData.currentStreak >= 3
                      ? 'text-[hsl(38,92%,68%)] fill-[hsl(38,92%,68%)]/20 animate-pulse'
                      : 'text-muted-foreground/60'
                  }`}
                />
              </div>
              <p
                className="text-4xl sm:text-5xl font-normal text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {focusData.currentStreak} <span className="text-sm font-sans text-muted-foreground">days</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-normal">
              {getEncouragement(focusData.currentStreak)}
            </p>
          </div>

          {/* Card 2: Total Sessions */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Sessions</span>
                <CheckCircle2 className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p
                className="text-4xl sm:text-5xl font-normal text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {focusData.totalSessions}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Completed focus blocks</p>
          </div>

          {/* Card 3: Total Hours */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Hours Focused</span>
                <Clock className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p
                className="text-4xl sm:text-5xl font-normal text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {(focusData.totalMinutes / 60).toFixed(1)} <span className="text-sm font-sans text-muted-foreground">hrs</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{focusData.totalMinutes} total minutes</p>
          </div>

          {/* Card 4: Longest Streak */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Longest Streak</span>
                <Award className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p
                className="text-4xl sm:text-5xl font-normal text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {focusData.longestStreak} <span className="text-sm font-sans text-muted-foreground">days</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Personal record</p>
          </div>
        </div>
      </div>

      {/* Main Timer Widget */}
      <div className="relative z-10 max-w-md mx-auto px-6 pb-16">
        <div className="liquid-glass-card rounded-2xl p-8 text-center relative overflow-hidden">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 liquid-glass rounded-full px-4 py-2 text-xs font-medium text-foreground animate-fade-rise border border-white/10 flex items-center gap-2">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Subject Input */}
          <div className="mb-6">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={status === 'running'}
              placeholder="What are you studying?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors text-center disabled:opacity-60"
            />
          </div>

          {/* Duration Selector Pills */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {PRESET_DURATIONS.map((dur) => (
              <button
                key={dur}
                disabled={status !== 'idle'}
                onClick={() => {
                  setIsCustom(false);
                  setSelectedDuration(dur);
                }}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-50 ${
                  !isCustom && selectedDuration === dur
                    ? 'gradient-cta'
                    : 'liquid-glass text-muted-foreground hover:text-foreground'
                }`}
              >
                {dur} min
              </button>
            ))}
            <button
              disabled={status !== 'idle'}
              onClick={() => setIsCustom(true)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-50 ${
                isCustom
                  ? 'gradient-cta'
                  : 'liquid-glass text-muted-foreground hover:text-foreground'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Duration Input */}
          {isCustom && status === 'idle' && (
            <div className="mb-6 flex items-center justify-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Minutes (1-180)"
                className="w-36 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground text-center focus:outline-none focus:border-white/30"
              />
              <span className="text-xs text-muted-foreground">mins</span>
            </div>
          )}

          {/* SVG Progress Ring */}
          <div className="relative w-56 h-56 mx-auto my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent-gradient-start))" />
                  <stop offset="100%" stopColor="hsl(var(--accent-gradient-end))" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-white/5"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progress animated circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#accentGradient)"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight select-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs text-muted-foreground mt-1 capitalize">
                {status === 'running' ? 'Focusing' : status === 'paused' ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="gradient-cta rounded-full px-8 py-3.5 text-sm font-medium inline-flex items-center gap-2 focus-visible:outline-none"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Session
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  onClick={handlePause}
                  className="liquid-glass rounded-full px-6 py-3 text-sm text-foreground inline-flex items-center gap-2 hover:scale-[1.03] transition-transform"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  onClick={handleReset}
                  className="liquid-glass rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}

            {status === 'paused' && (
              <>
                <button
                  onClick={handleStart}
                  className="gradient-cta rounded-full px-6 py-3 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Resume
                </button>
                <button
                  onClick={handleReset}
                  className="liquid-glass rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <h2
          className="text-2xl font-normal text-foreground mb-6 tracking-[-0.5px]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Recent Sessions
        </h2>

        {focusData.logs.length === 0 ? (
          <div className="liquid-glass-card rounded-2xl p-8 text-center text-muted-foreground text-sm">
            Your first session will show up here.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {focusData.logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="liquid-glass rounded-xl p-4 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg liquid-glass flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{log.subject}</p>
                    <p className="text-xs text-muted-foreground">{getRelativeDateLabel(log.date)}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground liquid-glass px-3 py-1 rounded-full">
                  {log.minutes} mins
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
