// src/pages/FocusRoom.tsx
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Play, Pause, RotateCcw, Users, Plus, LogOut } from 'lucide-react';
import { getFocusData, logSession, type FocusData } from '../lib/focusStorage';
import { fetchActiveStudyRooms, createStudyRoom, completeStudyRoomSession } from '../lib/studyRooms/studyRoomApi';
import type { StudyRoom } from '../types/ecosystem';
import { useAuth } from '../context/AuthContext';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function FocusRoom() {
  const { user } = useAuth();
  const [, setFocusData] = useState<FocusData>(() => getFocusData());
  const [subject, setSubject] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  // Active rooms state
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<StudyRoom | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');
  const [roomGoal, setRoomGoal] = useState('');
  const [roomDuration, setRoomDuration] = useState<number>(25);

  // Local Timer states
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setFocusData(getFocusData());
    fetchActiveStudyRooms().then(setStudyRooms);
  }, []);

  useEffect(() => {
    if (status === 'idle') {
      setRemainingSeconds(selectedDuration * 60);
    }
  }, [selectedDuration, status]);

  // Timer tick effect
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
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

  const handleComplete = async () => {
    setStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);

    const activeMinutes = selectedDuration;
    const updated = logSession(subject || joinedRoom?.goal || 'General Study', activeMinutes);
    setFocusData(updated);

    if (user) {
      await completeStudyRoomSession(user.id, subject || 'General Study', activeMinutes);
    }

    setToastMessage(`Session completed & logged 🔥 (+${activeMinutes} mins)`);
    setTimeout(() => setToastMessage(null), 5000);
    setRemainingSeconds(activeMinutes * 60);
  };

  const handleStart = () => {
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
    setRemainingSeconds(selectedDuration * 60);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !roomTitle.trim() || !roomGoal.trim()) return;

    const res = await createStudyRoom({
      hostId: user.id,
      title: roomTitle,
      goal: roomGoal,
      exam: 'GATE',
      durationMinutes: roomDuration,
      privacy: 'public',
    });

    if (res.success && res.room) {
      setJoinedRoom(res.room);
      setSelectedDuration(roomDuration);
      setSubject(roomGoal);
      setShowCreateModal(false);
      handleStart();
    }
  };

  const handleJoinRoom = (room: StudyRoom) => {
    setJoinedRoom(room);
    setSelectedDuration(room.duration_minutes);
    setSubject(room.goal);
    setRemainingSeconds(room.duration_minutes * 60);
    handleStart();
  };

  const totalSeconds = selectedDuration * 60;
  const progressPercent = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = 283 * (1 - progressPercent);

  return (
    <>
      <Helmet>
        <title>Study Rooms & Focus Timer — Study Hub</title>
        <meta name="description" content="Host and join quiet, timed study rooms. Build study habits together without distraction." />
      </Helmet>

      {/* Hero Strip */}
      <div className="relative z-10 px-6 pt-12 pb-8 text-center max-w-4xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Study Rooms & <span className="text-gradient-accent">Focus Timer.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mt-2 leading-relaxed">
          Join a silent study session with fellow aspirants or start your private focus block.
        </p>

        {/* Actual Pin 2 Video Frame */}
        <div className="mt-6 mx-auto max-w-xs rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950 aspect-[9/16] max-h-[320px] flex items-center justify-center">
          <video
            src="/assets/pinterest/actual-pin-975521969305585422.mp4"
            poster="/assets/pinterest/actual-pin-975521969305585422-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Live Study Rooms Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Active Study Rooms</h2>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="gradient-cta rounded-full px-4 py-2 text-xs text-slate-950 font-bold flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> Host Study Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studyRooms.map((room) => (
            <div
              key={room.id}
              className="liquid-glass-card rounded-2xl p-5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-2">
                  <span className="px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    {room.exam}
                  </span>
                  <span className="text-slate-400">{room.duration_minutes} min session</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">{room.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">Goal: {room.goal}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="text-[11px] text-slate-400">● {room.participant_count || 4} learners</span>
                <button
                  onClick={() => handleJoinRoom(room)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold text-xs transition-all"
                >
                  Join Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Active Room / Timer Widget */}
      <div className="relative z-10 max-w-md mx-auto px-6 pb-20">
        <div className="liquid-glass-card rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl border border-white/10">
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 liquid-glass rounded-full px-4 py-2 text-xs font-bold text-cyan-300 animate-fade-rise border border-cyan-500/40">
              {toastMessage}
            </div>
          )}

          {/* Joined Room Header */}
          {joinedRoom ? (
            <div className="mb-6 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block">Active Study Room</span>
              <p className="font-bold text-foreground text-sm">{joinedRoom.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Goal: {joinedRoom.goal}</p>
            </div>
          ) : (
            <div className="mb-6">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={status === 'running'}
                placeholder="What are you studying today?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground text-center focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          )}

          {/* SVG Progress Ring */}
          <div className="relative w-56 h-56 mx-auto my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="stroke-white/5" strokeWidth="6" fill="transparent" />
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

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight select-none font-mono">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs text-muted-foreground mt-1 capitalize font-medium">
                {status === 'running' ? 'Focused Study' : status === 'paused' ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="gradient-cta rounded-full px-8 py-3.5 text-xs font-bold text-slate-950 inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Start Session
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  onClick={handlePause}
                  className="liquid-glass rounded-full px-6 py-3 text-xs font-semibold text-foreground inline-flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button
                  onClick={() => {
                    setJoinedRoom(null);
                    handleReset();
                  }}
                  className="liquid-glass rounded-full px-5 py-3 text-xs font-semibold text-red-400 inline-flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Quietly
                </button>
              </>
            )}

            {status === 'paused' && (
              <>
                <button
                  onClick={handleStart}
                  className="gradient-cta rounded-full px-6 py-3 text-xs font-bold text-slate-950 inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> Resume
                </button>
                <button
                  onClick={handleReset}
                  className="liquid-glass rounded-full px-4 py-3 text-xs text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold mb-3">Host a Timed Study Room</h3>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Room Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE CS Subnetting PYQ Sprint"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Goal</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete 15 CN PYQs without distraction"
                  value={roomGoal}
                  onChange={(e) => setRoomGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Session Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setRoomDuration(dur)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        roomDuration === dur
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {dur} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-cta rounded-full px-6 py-2 text-xs text-slate-950 font-bold"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
