import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, CheckCircle, XCircle, Clock, BookOpen, AlertTriangle, Save, X, Activity } from 'lucide-react';

interface MockTest {
  id: string;
  title: string;
  exam_id: string;
  subject?: string;
  duration_minutes: number;
  total_questions: number;
  difficulty_level: string;
  question_selection_type: string;
  scoring_rules: Record<string, any>;
  scheduled_at?: string;
  is_official: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

interface ExamConfig {
  id: string;
  exam: string;
  scoring_rules: Record<string, any>;
}

export default function AdminMockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<MockTest> | null>(null);
  const [validationResult, setValidationResult] = useState<{valid: boolean, messages: string[]} | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, examsRes] = await Promise.all([
        supabase.from('mock_tests').select('*').order('created_at', { ascending: false }),
        supabase.from('exam_configurations').select('id, exam, scoring_rules')
      ]);

      if (testsRes.error) throw testsRes.error;
      if (examsRes.error) throw examsRes.error;

      setTests(testsRes.data || []);
      setExams(examsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTest?.title || !editingTest?.exam_id) return;

    try {
      const { error } = await supabase
        .from('mock_tests')
        .upsert(editingTest)
        .select();

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingTest(null);
      fetchData();
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to save mock test');
    }
  };

  const validateTest = () => {
    if (!editingTest) return;
    
    const messages: string[] = [];
    let valid = true;

    if (!editingTest.title || editingTest.title.trim() === '') {
      messages.push('Title is required');
      valid = false;
    }
    if (!editingTest.exam_id) {
      messages.push('Exam selection is required');
      valid = false;
    }
    if (!editingTest.duration_minutes || editingTest.duration_minutes <= 0) {
      messages.push('Duration must be greater than 0');
      valid = false;
    }
    if (!editingTest.total_questions || editingTest.total_questions <= 0) {
      messages.push('Total questions must be greater than 0');
      valid = false;
    }
    if (!editingTest.scoring_rules || Object.keys(editingTest.scoring_rules).length === 0) {
      messages.push('Scoring rules are missing');
      valid = false;
    }

    if (valid) {
      messages.push('All basic requirements met');
    }

    setValidationResult({ valid, messages });
  };

  const openModal = (test?: MockTest) => {
    if (test) {
      setEditingTest(test);
    } else {
      setEditingTest({
        status: 'draft',
        difficulty_level: 'Medium',
        question_selection_type: 'Random',
        is_official: false,
        scoring_rules: {},
        duration_minutes: 60,
        total_questions: 50
      });
    }
    setValidationResult(undefined);
    setIsModalOpen(true);
  };

  const handleExamChange = (examId: string) => {
    const selectedExam = exams.find(e => e.id === examId);
    setEditingTest(prev => ({
      ...prev,
      exam_id: examId,
      scoring_rules: selectedExam?.scoring_rules || (prev?.scoring_rules || {})
    }));
  };

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mock Test Builder</h1>
            <p className="text-white/60 mt-1">Create and manage mock examinations</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#5CE1E6] text-[#062B3D] px-4 py-2 rounded-xl font-bold hover:bg-[#4bc8cc] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Build New Test
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/20 text-white/60 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Exam</th>
                  <th className="px-6 py-4 font-medium">Questions/Time</th>
                  <th className="px-6 py-4 font-medium">Difficulty</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Validation</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-white/60">Loading tests...</td>
                  </tr>
                ) : tests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-white/60">No mock tests found</td>
                  </tr>
                ) : (
                  tests.map((test) => {
                    const exam = exams.find(e => e.id === test.exam_id);
                    return (
                      <tr key={test.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#5CE1E6]">{test.title}</div>
                          {test.is_official && <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/80 mt-1 inline-block">Official</span>}
                        </td>
                        <td className="px-6 py-4">{exam?.exam || 'Unknown Exam'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm text-white/80 gap-1">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {test.total_questions} Qs</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration_minutes} mins</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            test.difficulty_level === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            test.difficulty_level === 'Hard' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {test.difficulty_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            test.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            test.status === 'archived' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {test.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group-hover:opacity-100 opacity-70 transition-opacity">
                            {test.status === 'published' ? (
                              <CheckCircle className="w-5 h-5 text-green-400" aria-label="Validation Passed" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-400" aria-label="Needs Validation" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openModal(test)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl w-full max-w-3xl my-8">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#062B3D] rounded-t-2xl z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-[#5CE1E6] w-5 h-5" />
                {editingTest?.id ? 'Edit Mock Test' : 'Build Mock Test'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Test Title</label>
                  <input
                    type="text"
                    value={editingTest?.title || ''}
                    onChange={e => setEditingTest({...editingTest, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                    placeholder="e.g. JEE Main Full Test 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Exam Target</label>
                    <select
                      value={editingTest?.exam_id || ''}
                      onChange={e => handleExamChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none [&>option]:bg-[#062B3D]"
                    >
                      <option value="">Select Exam</option>
                      {exams.map(e => (
                        <option key={e.id} value={e.id}>{e.exam}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Subject (Optional)</label>
                    <input
                      type="text"
                      value={editingTest?.subject || ''}
                      onChange={e => setEditingTest({...editingTest, subject: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                      placeholder="e.g. Physics"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingTest?.duration_minutes || ''}
                      onChange={e => setEditingTest({...editingTest, duration_minutes: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Total Questions</label>
                    <input
                      type="number"
                      value={editingTest?.total_questions || ''}
                      onChange={e => setEditingTest({...editingTest, total_questions: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Difficulty</label>
                    <select
                      value={editingTest?.difficulty_level || 'Medium'}
                      onChange={e => setEditingTest({...editingTest, difficulty_level: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none [&>option]:bg-[#062B3D]"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Question Selection</label>
                    <select
                      value={editingTest?.question_selection_type || 'Random'}
                      onChange={e => setEditingTest({...editingTest, question_selection_type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none [&>option]:bg-[#062B3D]"
                    >
                      <option value="Fixed Set">Fixed Set</option>
                      <option value="Random">Random</option>
                      <option value="Topic Balanced">Topic Balanced</option>
                      <option value="Difficulty Balanced">Difficulty Balanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Status</label>
                    <select
                      value={editingTest?.status || 'draft'}
                      onChange={e => setEditingTest({...editingTest, status: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none [&>option]:bg-[#062B3D]"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Scheduled At (Optional)</label>
                    <input
                      type="datetime-local"
                      value={editingTest?.scheduled_at ? new Date(editingTest.scheduled_at).toISOString().slice(0, 16) : ''}
                      onChange={e => setEditingTest({...editingTest, scheduled_at: new Date(e.target.value).toISOString()})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none color-scheme-dark"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="is_official"
                    checked={editingTest?.is_official || false}
                    onChange={e => setEditingTest({...editingTest, is_official: e.target.checked})}
                    className="w-5 h-5 accent-[#5CE1E6] bg-white/5 border-white/10 rounded"
                  />
                  <label htmlFor="is_official" className="text-sm font-medium">Mark as Official Mock Test</label>
                </div>
              </div>

              
              <div className="md:col-span-1 space-y-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-white">Validation Panel</label>
                    <button
                      onClick={validateTest}
                      className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                    >
                      Run Check
                    </button>
                  </div>
                  
                  <div className="bg-black/20 rounded-xl p-4 min-h-[150px]">
                    {!validationResult ? (
                      <div className="text-center text-white/40 text-sm mt-8">
                        Click 'Run Check' to validate test configuration.
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {validationResult.messages.map((msg, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            {validationResult.valid ? (
                              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            ) : (
                              idx === validationResult.messages.length - 1 && validationResult.valid ? 
                                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> :
                                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <span className={validationResult.valid ? 'text-green-300/80' : 'text-red-300/80'}>
                              {msg}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-3">Scoring Rules Preview</label>
                  <div className="bg-black/20 rounded-xl p-4 max-h-[250px] overflow-y-auto">
                    {editingTest?.scoring_rules && Object.keys(editingTest.scoring_rules).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(editingTest.scoring_rules).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs bg-white/5 p-2 rounded">
                            <span className="text-[#5CE1E6] font-mono">{k}</span>
                            <span className="text-white/80">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-white/40 text-sm mt-2">
                        No scoring rules defined. Select an exam to inherit rules.
                      </div>
                    )}
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
                disabled={validationResult && !validationResult.valid}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-colors ${
                  validationResult && !validationResult.valid 
                    ? 'bg-gray-500/50 text-white/50 cursor-not-allowed'
                    : 'bg-[#5CE1E6] text-[#062B3D] hover:bg-[#4bc8cc]'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
