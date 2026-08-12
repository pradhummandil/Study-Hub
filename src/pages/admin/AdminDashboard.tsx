import React, { useEffect, useState } from 'react';
import {
  Users, BookOpen, HelpCircle, FileText, Bot,
  Flag, TrendingUp, Clock, CheckCircle, AlertCircle,
  RefreshCw, Activity, Zap, Shield, BarChart2, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  total_users: number;
  active_today: number;
  total_resources: number;
  total_questions: number;
  total_mock_tests: number;
  ai_requests_today: number;
  ai_failures_today: number;
  pending_reports: number;
}

interface AuditEntry {
  action: string;
  target_type: string;
  target_label: string | null;
  created_at: string;
  actor_role: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function MetricCard({
  icon,
  label,
  value,
  sub,
  color = 'cyan',
  loading = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  loading?: boolean;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'from-[#5CE1E6]/20 to-[#5CE1E6]/5 border-[#5CE1E6]/20 text-[#5CE1E6]',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${colorMap[color].split(' ').slice(-1)[0]}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse mb-1" />
      ) : (
        <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      )}
      <div className="text-sm text-white/60">{label}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    publish: 'bg-green-500/15 text-green-400',
    suspend: 'bg-red-500/15 text-red-400',
    restore: 'bg-blue-500/15 text-blue-400',
    change_role: 'bg-purple-500/15 text-purple-400',
    delete: 'bg-red-500/15 text-red-400',
    approve: 'bg-green-500/15 text-green-400',
    reject: 'bg-red-500/15 text-red-400',
    default: 'bg-white/10 text-white/60',
  };
  const key = Object.keys(colors).find(k => action.includes(k)) || 'default';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[key]}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActions, setRecentActions] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  async function loadStats() {
    try {
      // Try Edge Function first for real admin stats
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          apikey: SUPABASE_ANON_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActions(data.recentActions || []);
      } else {
        // Fallback: query directly (still server-verified via RLS)
        const { data } = await supabase.rpc('get_admin_dashboard_stats');
        if (data) setStats(data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[AdminDashboard] Failed to load stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (session) loadStats();
  }, [session]);

  function handleRefresh() {
    setRefreshing(true);
    loadStats();
  }

  const aiSuccessRate = stats
    ? stats.ai_requests_today > 0
      ? Math.round(((stats.ai_requests_today - stats.ai_failures_today) / stats.ai_requests_today) * 100)
      : 100
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#5CE1E6]" />
            <span className="text-[#5CE1E6] text-sm font-semibold tracking-wider uppercase">Admin Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
          >
            <Eye className="w-4 h-4" /> Student View
          </a>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5CE1E6]/10 border border-[#5CE1E6]/20 text-[#5CE1E6] hover:bg-[#5CE1E6]/20 text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats?.total_users ?? '—'}
          sub="registered accounts"
          color="cyan"
          loading={loading}
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          label="Active Today"
          value={stats?.active_today ?? '—'}
          sub="meaningful study sessions"
          color="green"
          loading={loading}
        />
        <MetricCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Resources"
          value={stats?.total_resources ?? '—'}
          sub="published & available"
          color="blue"
          loading={loading}
        />
        <MetricCard
          icon={<HelpCircle className="w-5 h-5" />}
          label="Questions"
          value={stats?.total_questions ?? '—'}
          sub="approved in bank"
          color="purple"
          loading={loading}
        />
        <MetricCard
          icon={<FileText className="w-5 h-5" />}
          label="Mock Tests"
          value={stats?.total_mock_tests ?? '—'}
          sub="published tests"
          color="orange"
          loading={loading}
        />
        <MetricCard
          icon={<Bot className="w-5 h-5" />}
          label="AI Requests Today"
          value={stats?.ai_requests_today ?? '—'}
          sub={`${aiSuccessRate}% success rate`}
          color="pink"
          loading={loading}
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="AI Failures"
          value={stats?.ai_failures_today ?? '—'}
          sub="today's error count"
          color={stats && stats.ai_failures_today > 20 ? 'red' : 'yellow'}
          loading={loading}
        />
        <MetricCard
          icon={<Flag className="w-5 h-5" />}
          label="Reports Pending"
          value={stats?.pending_reports ?? '—'}
          sub="awaiting moderation"
          color={stats && stats.pending_reports > 5 ? 'red' : 'orange'}
          loading={loading}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admin Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <h2 className="text-white font-semibold text-sm">Recent Admin Actions</h2>
            </div>
            <a href="/admin/audit-log" className="text-[#5CE1E6] text-xs hover:underline">View all →</a>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-white/10 rounded animate-pulse" />
                </div>
              ))
            ) : recentActions.length === 0 ? (
              <div className="px-5 py-8 text-center text-white/30 text-sm">
                No admin actions recorded yet
              </div>
            ) : (
              recentActions.slice(0, 8).map((entry, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <ActionBadge action={entry.action} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs truncate">{entry.target_label || entry.target_type}</div>
                  </div>
                  <div className="text-white/30 text-xs flex-shrink-0">
                    {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-white/40" />
              <h2 className="text-white font-semibold text-sm">Quick Actions</h2>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Add Resource', icon: <BookOpen className="w-4 h-4" />, href: '/admin/resources?action=create', color: 'border-blue-500/20 hover:border-blue-500/40' },
              { label: 'Add Question', icon: <HelpCircle className="w-4 h-4" />, href: '/admin/questions?action=create', color: 'border-purple-500/20 hover:border-purple-500/40' },
              { label: 'View Reports', icon: <Flag className="w-4 h-4" />, href: '/admin/reports', color: 'border-orange-500/20 hover:border-orange-500/40' },
              { label: 'Announce', icon: <TrendingUp className="w-4 h-4" />, href: '/admin/announcements?action=create', color: 'border-pink-500/20 hover:border-pink-500/40' },
              { label: 'Resource Health', icon: <CheckCircle className="w-4 h-4" />, href: '/admin/resources/health', color: 'border-green-500/20 hover:border-green-500/40' },
              { label: 'System Health', icon: <Activity className="w-4 h-4" />, href: '/admin/system', color: 'border-cyan-500/20 hover:border-cyan-500/40' },
              { label: 'AI Panel', icon: <Bot className="w-4 h-4" />, href: '/admin/study-ai', color: 'border-pink-500/20 hover:border-pink-500/40' },
              { label: 'Analytics', icon: <BarChart2 className="w-4 h-4" />, href: '/admin/analytics', color: 'border-yellow-500/20 hover:border-yellow-500/40' },
            ].map(action => (
              <a
                key={action.label}
                href={action.href}
                className={`flex items-center gap-2.5 p-3 rounded-xl bg-white/3 border ${action.color} text-white/70 hover:text-white text-sm font-medium transition-all hover:bg-white/8`}
              >
                <span className="text-white/40">{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
