import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Plus, BookOpen, Lock, Calendar, CheckCircle2 } from 'lucide-react';
import { getMentorDashboardData, createAssignment } from '../lib/institution/institutionApi';
import type { Assignment } from '../types/phase5';

export default function MentorPortal() {
  const [data, setData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'pyq' | 'mock' | 'quiz' | 'flashcards' | 'resource' | 'topic'>('pyq');
  const [newDueDate, setNewDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMentorDashboardData('org_abc_123').then(setData);
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    const created = await createAssignment(
      'org_abc_123',
      'mentor_1',
      newTitle,
      newDesc,
      newType,
      newDueDate || new Date(Date.now() + 7 * 86400000).toISOString()
    );

    setLoading(false);
    if (created) {
      setData((prev: any) => ({
        ...prev,
        assignments: [created, ...(prev?.assignments || [])],
        pendingAssignmentsCount: (prev?.pendingAssignmentsCount || 0) + 1,
      }));
      setNewTitle('');
      setNewDesc('');
      setShowCreateModal(false);
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Teacher & Mentor Portal | Study Hub</title>
        <meta
          name="description"
          content="Empower mentors and educators with student cohort analytics, assignment distribution, and progress tracking."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-4 h-4" /> Mentor & Educator Foundation
            </div>
            <h1 className="text-3xl font-black text-white">{data.organization.name}</h1>
            <p className="text-slate-400 text-xs mt-1">Cohort Performance & Assignment Distribution Center</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-slate-950 flex items-center gap-2 hover:brightness-110 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Create Student Assignment
          </button>
        </div>

        {/* Core Institutional Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Enrolled</span>
            <div className="text-2xl font-black text-white">{data.totalStudents.toLocaleString()}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Active This Week</span>
            <div className="text-2xl font-black text-emerald-400">{data.activeThisWeek.toLocaleString()}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Average Accuracy</span>
            <div className="text-2xl font-black text-[#5CE1E6]">{data.averageAccuracyPct}%</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Difficult Topic</span>
            <div className="text-xs font-bold text-amber-300 truncate">{data.mostDifficultTopic}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Pending Assignments</span>
            <div className="text-2xl font-black text-indigo-400">{data.pendingAssignmentsCount}</div>
          </div>
        </div>

        {/* Student Privacy Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
          <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>
            Student Privacy Policy: Only student activities tagged as <strong className="text-white">shared_with_mentor</strong> or <strong className="text-white">organization_visible</strong> are accessible to mentors. Private StudyMate chats remain strictly confidential.
          </span>
        </div>

        {/* Active Assignments */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#5CE1E6]" /> Active Cohort Assignments
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.assignments.map((asg: Assignment) => (
              <div key={asg.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                    {asg.type}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Due: {new Date(asg.due_date || '').toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{asg.title}</h4>
                <p className="text-xs text-slate-400">{asg.description}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-300">
                  <span>Assigned to: All Cohort Students</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 84% Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-[#062B3D] border border-cyan-500/30 p-6 text-white space-y-4">
              <h3 className="text-lg font-bold">Create New Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. GATE Computer Networks PYQ Sprint"
                    className="w-full rounded-xl bg-slate-900 border border-cyan-500/30 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Solve 25 mandatory questions..."
                    rows={2}
                    className="w-full rounded-xl bg-slate-900 border border-cyan-500/30 p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-cyan-500/30 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-900 border border-cyan-500/30 px-3 py-2 text-xs text-white"
                  >
                    <option value="pyq">PYQ Set</option>
                    <option value="mock">Mock Test</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="flashcards">Flashcards Review</option>
                    <option value="resource">Resource Reading</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    {loading ? 'Creating...' : 'Assign to Cohort'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
