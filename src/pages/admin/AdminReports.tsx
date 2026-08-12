import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  MessageSquare, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Shield,
  Ban,
  MessageCircle,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityReport {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'user' | 'room';
  target_id: string;
  reason: string;
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
}

type TabType = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export default function AdminReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
    fetchReports();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setIsAdmin(data?.role === 'admin' || data?.role === 'super_admin');
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, newStatus: TabType) => {
    if (!selectedReport || !user || !isAdmin) return;

    try {
      // 1. Update report status
      const { error: updateError } = await supabase
        .from('community_reports')
        .update({ status: newStatus })
        .eq('id', selectedReport.id);

      if (updateError) throw updateError;

      // 2. Log audit trail
      const { error: auditError } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: user.id,
          action_type: action,
          target_table: 'community_reports',
          target_id: selectedReport.id,
          details: {
            previous_status: selectedReport.status,
            new_status: newStatus,
            notes: moderatorNotes
          }
        });

      if (auditError) throw auditError;

      setIsActionModalOpen(false);
      setSelectedReport(null);
      setModeratorNotes('');
      fetchReports();
      
    } catch (error) {
      console.error('Error taking action:', error);
      alert('Failed to execute moderation action');
    }
  };

  const openActionModal = (report: CommunityReport) => {
    setSelectedReport(report);
    setModeratorNotes('');
    setIsActionModalOpen(true);
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'user': return <User className="w-5 h-5 text-purple-400" />;
      case 'room': return <MessageCircle className="w-5 h-5 text-orange-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredReports = reports.filter(r => r.status === activeTab);
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-[#04202E] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-white/60">You do not have permission to access the Moderation Center.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Moderation Center
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                  {pendingCount} Pending
                </span>
              )}
            </h1>
            <p className="text-white/60 mt-1">Review and manage community reports</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['pending', 'investigating', 'resolved', 'dismissed'] as TabType[]).map(tab => {
            const count = reports.filter(r => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-[#5CE1E6] text-[#062B3D]' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab ? 'bg-black/20 text-[#062B3D]' : 'bg-white/10 text-white/80'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/60">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">All Clear!</h3>
            <p className="text-white/60">No {activeTab} reports to show right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/20 rounded-lg">
                      {getTargetIcon(report.target_type)}
                    </div>
                    <div>
                      <div className="font-bold capitalize text-white/90">{report.target_type} Report</div>
                      <div className="text-xs text-white/50 flex items-center gap-1">
                        <User className="w-3 h-3" /> User #{report.reporter_id.slice(0, 4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </div>
                </div>

                <div className="mb-4 flex-1">
                  <div className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded mb-2 border border-red-500/20">
                    Reason: {report.reason}
                  </div>
                  <p className="text-sm text-white/80 line-clamp-3 bg-black/20 p-3 rounded-lg border border-white/5">
                    "{report.details}"
                  </p>
                  <div className="mt-3 text-xs text-white/40 font-mono break-all">
                    Target ID: {report.target_id}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                  <button
                    onClick={() => openActionModal(report)}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isActionModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#062B3D]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-[#5CE1E6] w-5 h-5" />
                Moderate Content
              </h2>
              <button 
                onClick={() => setIsActionModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-white/80">
                <div className="font-bold text-white mb-1 capitalize">Report on {selectedReport.target_type}</div>
                <div className="text-[#5CE1E6] font-medium mb-2">{selectedReport.reason}</div>
                <div className="italic bg-black/20 p-2 rounded">"{selectedReport.details}"</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Moderator Notes (Audit Log)</label>
                <textarea
                  value={moderatorNotes}
                  onChange={e => setModeratorNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#5CE1E6]/50 outline-none resize-none h-24 text-sm"
                  placeholder="Enter context or reasoning for this action..."
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-sm font-bold text-white mb-2">Select Action</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('investigate', 'investigating')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 transition-colors"
                  >
                    <EyeOff className="w-5 h-5" />
                    <span className="text-sm font-bold">Investigate</span>
                  </button>

                  <button
                    onClick={() => handleAction('dismiss', 'dismissed')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded-xl border border-gray-500/20 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">Dismiss</span>
                  </button>

                  <button
                    onClick={() => handleAction('remove_content', 'resolved')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/20 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-bold">Remove Content</span>
                  </button>

                  <button
                    onClick={() => handleAction('suspend_user', 'resolved')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors"
                  >
                    <Ban className="w-5 h-5" />
                    <span className="text-sm font-bold">Suspend User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
