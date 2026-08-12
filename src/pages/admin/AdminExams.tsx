import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

interface ExamConfig {
  id: string;
  exam: string;
  exam_code: string;
  duration_minutes: number;
  total_questions: number;
  negative_marking: boolean;
  exam_month: string;
  status: 'active' | 'inactive' | 'upcoming';
  official_website: string;
  question_types: string[];
  scoring_rules: Record<string, string | number>;
  created_at?: string;
  updated_at?: string;
}

const QUESTION_TYPES = ['MCQ', 'MSQ', 'NAT', 'Numerical', 'True/False'];

export default function AdminExams() {
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<ExamConfig> | null>(null);
  const [scoringKey, setScoringKey] = useState('');
  const [scoringValue, setScoringValue] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_configurations')
        .select('*')
        .order('exam');
      
      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingExam?.exam || !editingExam?.exam_code) return;

    try {
      const payload = {
        ...editingExam,
        question_types: editingExam.question_types || [],
        scoring_rules: editingExam.scoring_rules || {},
      };

      const { error } = await supabase
        .from('exam_configurations')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingExam(null);
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to save exam');
    }
  };

  const toggleQuestionType = (type: string) => {
    if (!editingExam) return;
    const currentTypes = editingExam.question_types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setEditingExam({ ...editingExam, question_types: newTypes });
  };

  const addScoringRule = () => {
    if (!editingExam || !scoringKey || !scoringValue) return;
    
    setEditingExam({
      ...editingExam,
      scoring_rules: {
        ...(editingExam.scoring_rules || {}),
        [scoringKey]: isNaN(Number(scoringValue)) ? scoringValue : Number(scoringValue)
      }
    });
    setScoringKey('');
    setScoringValue('');
  };

  const removeScoringRule = (key: string) => {
    if (!editingExam?.scoring_rules) return;
    
    const newRules = { ...editingExam.scoring_rules };
    delete newRules[key];
    
    setEditingExam({
      ...editingExam,
      scoring_rules: newRules
    });
  };

  const handleStatusToggle = async (exam: ExamConfig) => {
    try {
      const newStatus = exam.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('exam_configurations')
        .update({ status: newStatus })
        .eq('id', exam.id);

      if (error) throw error;
      fetchExams();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-white/60 mt-1">Configure and manage exam specifications</p>
          </div>
          <button
            onClick={() => {
              setEditingExam({
                status: 'upcoming',
                question_types: [],
                scoring_rules: {}
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#5CE1E6] text-[#062B3D] px-4 py-2 rounded-xl font-bold hover:bg-[#4bc8cc] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Exam
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/60">Loading exams...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
                <div className="p-6 cursor-pointer" onClick={() => setExpandedId(expandedId === exam.id ? null : exam.id)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#5CE1E6]">{exam.exam}</h3>
                      <p className="text-sm text-white/60">{exam.exam_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingExam(exam);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {expandedId === exam.id ? (
                        <ChevronUp className="w-5 h-5 text-white/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Duration:</span>
                      <span>{exam.duration_minutes} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Questions:</span>
                      <span>{exam.total_questions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Status:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(exam);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          exam.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          exam.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {exam.status.toUpperCase()}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === exam.id && (
                  <div className="p-6 pt-0 border-t border-white/10 bg-black/20">
                    <pre className="text-xs text-white/70 overflow-x-auto p-4 rounded-xl bg-black/40 mt-4">
                      {JSON.stringify(exam, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#062B3D] rounded-t-2xl z-10">
              <h2 className="text-xl font-bold">
                {editingExam?.id ? 'Edit Exam' : 'Add New Exam'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Exam Name</label>
                  <input
                    type="text"
                    value={editingExam?.exam || ''}
                    onChange={e => setEditingExam({...editingExam, exam: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none"
                    placeholder="e.g. JEE Advanced"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Exam Code</label>
                  <input
                    type="text"
                    value={editingExam?.exam_code || ''}
                    onChange={e => setEditingExam({...editingExam, exam_code: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none"
                    placeholder="e.g. JEE_ADV"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingExam?.duration_minutes || ''}
                    onChange={e => setEditingExam({...editingExam, duration_minutes: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Total Questions</label>
                  <input
                    type="number"
                    value={editingExam?.total_questions || ''}
                    onChange={e => setEditingExam({...editingExam, total_questions: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Exam Month</label>
                  <input
                    type="text"
                    value={editingExam?.exam_month || ''}
                    onChange={e => setEditingExam({...editingExam, exam_month: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none"
                    placeholder="e.g. May"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Status</label>
                  <select
                    value={editingExam?.status || 'active'}
                    onChange={e => setEditingExam({...editingExam, status: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none [&>option]:bg-[#062B3D]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Official Website</label>
                <input
                  type="url"
                  value={editingExam?.official_website || ''}
                  onChange={e => setEditingExam({...editingExam, official_website: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-[#5CE1E6]/50 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="negative_marking"
                  checked={editingExam?.negative_marking || false}
                  onChange={e => setEditingExam({...editingExam, negative_marking: e.target.checked})}
                  className="w-5 h-5 accent-[#5CE1E6] bg-white/5 border-white/10 rounded"
                />
                <label htmlFor="negative_marking" className="text-sm">Enable Negative Marking</label>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-3">Question Types</label>
                <div className="flex flex-wrap gap-3">
                  {QUESTION_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10">
                      <input
                        type="checkbox"
                        checked={editingExam?.question_types?.includes(type) || false}
                        onChange={() => toggleQuestionType(type)}
                        className="accent-[#5CE1E6]"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-3">Scoring Rules</label>
                <div className="bg-black/20 rounded-xl p-4 space-y-4">
                  {Object.entries(editingExam?.scoring_rules || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
                      <span className="font-mono text-[#5CE1E6] flex-1">{key}</span>
                      <span className="font-mono text-white/80">{value}</span>
                      <button onClick={() => removeScoringRule(key)} className="text-red-400 hover:bg-white/10 p-1 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Rule Key (e.g. MCQ_CORRECT)"
                      value={scoringKey}
                      onChange={e => setScoringKey(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-[#5CE1E6]/50 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={scoringValue}
                      onChange={e => setScoringValue(e.target.value)}
                      className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-[#5CE1E6]/50 outline-none"
                    />
                    <button
                      onClick={addScoringRule}
                      className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#062B3D] rounded-b-2xl z-10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#5CE1E6] text-[#062B3D] px-6 py-2 rounded-xl font-bold hover:bg-[#4bc8cc] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
