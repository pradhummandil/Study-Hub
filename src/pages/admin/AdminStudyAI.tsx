import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Brain, Activity, Settings2, BarChart2, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface UsageMetrics {
  requests_today: number;
  successful: number;
  failed: number;
  avg_latency: number;
}

interface PromptVersion {
  id: string;
  name: string;
  version: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

interface ChartData {
  date: string;
  count: number;
}

const AdminStudyAI = () => {
  const [metrics, setMetrics] = useState<UsageMetrics>({
    requests_today: 0,
    successful: 0,
    failed: 0,
    avg_latency: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [rateLimit] = useState(50);
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
  const [feedbackStats, setFeedbackStats] = useState({ helpful: 0, total: 0 });
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ name: '', version: '', prompt_text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock metrics for UI since ai_usage_metrics might not be fully populated
      setMetrics({
        requests_today: 1245,
        successful: 1200,
        failed: 45,
        avg_latency: 840,
      });

      // Mock chart data for last 7 days
      const mockChart = Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        count: Math.floor(Math.random() * 1000) + 500,
      }));
      setChartData(mockChart);

      // Fetch Feature Flags
      const { data: flagData } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('key', 'study_ai_enabled')
        .single();
      
      if (flagData) {
        setIsAiEnabled(flagData.value === 'true' || flagData.value === true);
      }

      // Fetch Prompt Versions
      const { data: promptsData } = await supabase
        .from('ai_prompt_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (promptsData) setPromptVersions(promptsData);

      // Mock Feedback stats
      setFeedbackStats({ helpful: 850, total: 1000 });
      setRecentFeedback([
        { id: 1, helpful: true, comment: 'Great explanation of cellular respiration!', created_at: new Date().toISOString() },
        { id: 2, helpful: false, comment: 'A bit too long.', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, helpful: true, comment: 'Spot on.', created_at: new Date(Date.now() - 7200000).toISOString() },
      ]);

    } catch (error) {
      console.error('Error fetching AI data:', error);
    }
  };

  const toggleAiFeature = async () => {
    const newVal = !isAiEnabled;
    setIsAiEnabled(newVal);
    try {
      await supabase
        .from('feature_flags')
        .upsert({ key: 'study_ai_enabled', value: newVal.toString() });
    } catch (error) {
      console.error('Error toggling AI:', error);
      setIsAiEnabled(!newVal);
    }
  };

  const handleSetActivePrompt = async (id: string) => {
    try {
      // Deactivate all
      await supabase
        .from('ai_prompt_versions')
        .update({ is_active: false })
        .neq('id', id);
      
      // Activate selected
      await supabase
        .from('ai_prompt_versions')
        .update({ is_active: true })
        .eq('id', id);
        
      fetchData();
    } catch (error) {
      console.error('Error setting active prompt:', error);
    }
  };

  const handleAddPrompt = async () => {
    if (!newPrompt.name || !newPrompt.version || !newPrompt.prompt_text) return;
    try {
      await supabase
        .from('ai_prompt_versions')
        .insert([{ ...newPrompt, is_active: false }]);
      setShowAddPrompt(false);
      setNewPrompt({ name: '', version: '', prompt_text: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding prompt:', error);
    }
  };

  const maxChartVal = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="text-[#5CE1E6]" size={32} />
            StudyMate AI Management
          </h1>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-2 px-4">
            <span className="font-medium text-gray-300">StudyMate Enabled</span>
            <button
              onClick={toggleAiFeature}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAiEnabled ? 'bg-[#5CE1E6]' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Requests Today', value: metrics.requests_today, icon: Activity },
            { label: 'Successful', value: metrics.successful, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Failed', value: metrics.failed, icon: XCircle, color: 'text-red-400' },
            { label: 'Avg Latency', value: `${metrics.avg_latency}ms`, icon: Clock, color: 'text-yellow-400' },
            { label: 'Success Rate', value: `${((metrics.successful / Math.max(metrics.requests_today, 1)) * 100).toFixed(1)}%`, icon: BarChart2, color: 'text-[#5CE1E6]' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <stat.icon size={16} className={stat.color || 'text-gray-400'} />
                {stat.label}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart2 className="text-[#5CE1E6]" />
                Request Volume (Last 7 Days)
              </h2>
              <div className="h-64 flex items-end gap-2 justify-between mt-4">
                {chartData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                    <div className="w-full relative flex justify-center h-full items-end">
                      <div 
                        className="w-full max-w-[40px] bg-[#5CE1E6]/20 hover:bg-[#5CE1E6]/40 border border-[#5CE1E6]/30 rounded-t-sm transition-all relative"
                        style={{ height: `${(d.count / maxChartVal) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 px-2 py-1 rounded text-xs transition-opacity">
                          {d.count}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompts Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings2 className="text-[#5CE1E6]" />
                  AI Prompt Versions
                </h2>
                <button
                  onClick={() => setShowAddPrompt(!showAddPrompt)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> Add Version
                </button>
              </div>

              {showAddPrompt && (
                <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Prompt Name (e.g. Standard Tutor)"
                      value={newPrompt.name}
                      onChange={e => setNewPrompt({...newPrompt, name: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5CE1E6]/50"
                    />
                    <input
                      type="text"
                      placeholder="Version (e.g. v1.2)"
                      value={newPrompt.version}
                      onChange={e => setNewPrompt({...newPrompt, version: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5CE1E6]/50"
                    />
                  </div>
                  <textarea
                    placeholder="System Prompt Text..."
                    value={newPrompt.prompt_text}
                    onChange={e => setNewPrompt({...newPrompt, prompt_text: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5CE1E6]/50 min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddPrompt(false)} className="px-3 py-1.5 text-sm hover:bg-white/5 rounded-lg">Cancel</button>
                    <button onClick={handleAddPrompt} className="px-3 py-1.5 text-sm bg-[#5CE1E6] text-[#062B3D] font-bold rounded-lg hover:brightness-110">Save Prompt</button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Version</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {promptVersions.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-400">No prompt versions found.</td></tr>
                    ) : (
                      promptVersions.map(p => (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="py-3">{p.name}</td>
                          <td className="py-3"><span className="bg-white/10 px-2 py-0.5 rounded text-xs">{p.version}</span></td>
                          <td className="py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="py-3">
                            {p.is_active ? (
                              <span className="text-green-400 text-xs font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Active</span>
                            ) : (
                              <span className="text-gray-500 text-xs font-medium">Inactive</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {!p.is_active && (
                              <button
                                onClick={() => handleSetActivePrompt(p.id)}
                                className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                              >
                                Set Active
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            
            {/* Configuration Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Model Configuration</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Current Model</span>
                  <span className="font-medium bg-[#5CE1E6]/10 text-[#5CE1E6] px-2 py-1 rounded">gemini-flash-latest</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Temperature</span>
                  <span className="font-medium">0.7</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Max Tokens</span>
                  <span className="font-medium">8192</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Rate Limit (req/min)</span>
                  <span className="font-medium">{rateLimit}</span>
                </div>
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">AI Feedback</h3>
              
              {/* Simple Pie-like display */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-full border-[8px] border-white/10 relative flex items-center justify-center shrink-0" 
                     style={{
                       borderTopColor: '#5CE1E6',
                       borderRightColor: '#5CE1E6',
                       transform: `rotate(${((feedbackStats.helpful/feedbackStats.total)*360)/2}deg)`
                     }}>
                  <div style={{transform: `rotate(-${((feedbackStats.helpful/feedbackStats.total)*360)/2}deg)`}} className="text-center">
                    <div className="text-xl font-bold">{Math.round((feedbackStats.helpful / feedbackStats.total) * 100)}%</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Helpful vs Not Helpful</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-[#5CE1E6]"></span> {feedbackStats.helpful} Helpful</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20"></span> {feedbackStats.total - feedbackStats.helpful} Not Helpful</div>
                </div>
              </div>

              {/* Recent Feedback List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-400 border-b border-white/10 pb-2">Recent Comments</h4>
                {recentFeedback.map(f => (
                  <div key={f.id} className="bg-black/20 rounded-lg p-3 border border-white/5 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      {f.helpful ? (
                        <span className="text-green-400 flex items-center gap-1 text-xs font-medium"><CheckCircle2 size={12} /> Helpful</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 text-xs font-medium"><XCircle size={12} /> Not Helpful</span>
                      )}
                      <span className="text-[10px] text-gray-500">{new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 italic">"{f.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminStudyAI;
