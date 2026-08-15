import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';
import {
  fetchOrCreateTodayPlan,
  updateTaskStatus,
  type TodayPlan as DailyStudyPlan,
  type PlannerTaskStatus,
} from '../../lib/intelligence/dailyPlannerEngine';

interface TodayPlanProps {
  onOpenDiagnostic?: () => void;
}

export const TodayPlan: React.FC<TodayPlanProps> = () => {
  const { userId, profile, learningState, targetExam } = useStudentContext();
  const [plan, setPlan] = useState<DailyStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchOrCreateTodayPlan(userId, profile, learningState).then((p) => {
      if (isMounted) {
        setPlan(p);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userId, profile, learningState]);

  const handleStatusUpdate = async (taskId: string, newStatus: PlannerTaskStatus) => {
    if (!plan) return;
    const updated = await updateTaskStatus(plan, taskId, newStatus, userId);
    setPlan(updated);
  };

  if (loading || !plan) {
    return (
      <div className="bg-paper rounded-3xl p-6 border border-forest/10 shadow-card animate-pulse space-y-4">
        <div className="h-6 bg-parchment rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-20 bg-parchment rounded-2xl" />
          <div className="h-20 bg-parchment rounded-2xl" />
        </div>
      </div>
    );
  }

  const completionPct = Math.round((plan.completedCount / plan.totalTasks) * 100);

  return (
    <div className="bg-paper rounded-3xl p-5 sm:p-6 border border-forest/10 shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
              TODAY'S STUDY PLAN
            </span>
            <span className="text-[10px] font-mono font-semibold text-scholar bg-scholar/10 px-2 py-0.5 rounded-full">
              {completionPct}% Done
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-normal text-ink mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Actionable Schedule for {targetExam}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] text-muted font-mono bg-parchment px-3 py-1 rounded-xl border border-forest/10 shrink-0 font-semibold flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-scholar" />
            <span>{plan.completedCount}/{plan.totalTasks} Tasks</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plan.tasks.map((task) => {
          const isDone = task.status === 'completed';
          const isSkipped = task.status === 'skipped';
          const isPending = task.status === 'pending';

          return (
            <div
              key={task.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200/70'
                  : isSkipped
                  ? 'bg-parchment/30 border-forest/5 opacity-60'
                  : 'bg-parchment/60 hover:bg-parchment/90 border-forest/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-scholar/10 text-scholar rounded-md">
                    {task.timeSlot}
                  </span>
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                    {task.subject}
                  </span>
                </div>

                <h3 className={`text-sm font-bold text-ink mt-2 ${isDone ? 'line-through text-muted' : ''}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed mt-0.5">
                  {task.description}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-forest/5">
                <div className="flex items-center gap-1.5">
                  {isPending && (
                    <Link
                      to={task.actionUrl}
                      className="px-3 py-1.5 rounded-xl text-xs text-paper bg-scholar font-bold inline-flex items-center gap-1 hover:bg-forest transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-paper" />
                      <span>Start</span>
                    </Link>
                  )}

                  {task.status === 'in_progress' && (
                    <Link
                      to={task.actionUrl}
                      className="px-3 py-1.5 rounded-xl text-xs text-paper bg-terracotta font-bold inline-flex items-center gap-1 hover:bg-terracotta/90 transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-paper" />
                      <span>Continue</span>
                    </Link>
                  )}

                  {!isDone && (
                    <button
                      onClick={() => handleStatusUpdate(task.id, 'completed')}
                      className="p-1.5 rounded-xl text-muted hover:text-emerald-700 hover:bg-emerald-100/60 transition-colors"
                      title="Mark Complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  {!isSkipped && !isDone && (
                    <button
                      onClick={() => handleStatusUpdate(task.id, 'skipped')}
                      className="p-1.5 rounded-xl text-muted hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                      title="Skip Task"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  {(isDone || isSkipped) && (
                    <button
                      onClick={() => handleStatusUpdate(task.id, 'pending')}
                      className="text-[11px] font-mono text-scholar font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="text-[10px] font-mono text-muted">
                  {task.durationMinutes}m {task.questionCount ? `• ${task.questionCount} Qs` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
