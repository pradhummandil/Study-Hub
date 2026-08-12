import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Edit2, 
  X, 
  Check, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Question {
  id: string;
  exam: string;
  year: number;
  subject: string;
  topic: string;
  difficulty: string;
  question_type: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  source_type: string;
  review_status: string;
  created_at: string;
  normalized_hash?: string;
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingData, setEditingData] = useState<Partial<Question> | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
        
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingData) return;
    try {
      const { error } = await supabase.from('practice_questions').upsert([editingData as any]);
      if (error) throw error;
      setModalOpen(false);
      setEditMode(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('practice_questions').update({ review_status: status }).eq('id', id);
      if (error) throw error;
      fetchQuestions();
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(prev => prev ? {...prev, review_status: status} : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'needs_edit': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'MCQ': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'MSQ': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'NUMERICAL': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'TRUE/FALSE': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'SHORT ANSWER': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Question Bank CMS</h1>
            <p className="text-white/60 mt-2">Manage and review practice questions</p>
          </div>
          <button 
            onClick={() => {
              setEditingData({
                exam: 'JEE',
                difficulty: 'Medium',
                question_type: 'MCQ',
                review_status: 'pending_review',
                options: ['', '', '', ''],
                source_type: 'manual'
              });
              setEditMode(true);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5CE1E6] text-[#062B3D] font-bold rounded-xl hover:bg-[#5CE1E6]/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Question
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-4 overflow-x-auto bg-white/5 p-4 rounded-2xl border border-white/10">
          {['Exam', 'Subject', 'Difficulty', 'Question Type', 'Review Status'].map(f => (
            <select key={f} className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none">
              <option value="">{f}</option>
            </select>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium text-white/60">Exam / Year</th>
                  <th className="p-4 font-medium text-white/60">Subject / Topic</th>
                  <th className="p-4 font-medium text-white/60">Type & Difficulty</th>
                  <th className="p-4 font-medium text-white/60">Review Status</th>
                  <th className="p-4 font-medium text-white/60">Source</th>
                  <th className="p-4 font-medium text-white/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-white/60">Loading...</td></tr>
                ) : questions.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-white/60">No questions found.</td></tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                      setSelectedQuestion(q);
                      setEditingData(q);
                      setEditMode(false);
                      setModalOpen(true);
                    }}>
                      <td className="p-4">
                        <div className="font-medium">{q.exam || '-'}</div>
                        <div className="text-sm text-white/60">{q.year || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{q.subject || '-'}</div>
                        <div className="text-sm text-white/60 max-w-[200px] truncate">{q.topic || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(q.question_type)}`}>
                            {q.question_type}
                          </span>
                          <span className="text-xs text-white/60">{q.difficulty}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${getStatusColor(q.review_status)}`}>
                          {q.review_status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-white/60">
                        {q.source_type}
                      </td>
                      <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => updateStatus(q.id, 'approved')} className="p-2 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors tooltip" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(q.id, 'rejected')} className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors tooltip" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
            <span className="text-sm text-white/60">Page {page}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={questions.length < itemsPerPage}
                className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">
                {editMode ? (editingData?.id ? 'Edit Question' : 'Add Question') : 'Question Details'}
              </h2>
              <div className="flex gap-2">
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                )}
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Exam</label>
                      <select value={editingData?.exam || ''} onChange={e => setEditingData({...editingData, exam: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5">
                        <option value="JEE">JEE</option>
                        <option value="NEET">NEET</option>
                        <option value="UPSC">UPSC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Year</label>
                      <input type="number" value={editingData?.year || ''} onChange={e => setEditingData({...editingData, year: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Difficulty</label>
                      <select value={editingData?.difficulty || ''} onChange={e => setEditingData({...editingData, difficulty: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Type</label>
                      <select value={editingData?.question_type || ''} onChange={e => setEditingData({...editingData, question_type: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5">
                        <option value="MCQ">MCQ</option>
                        <option value="MSQ">MSQ</option>
                        <option value="Numerical">Numerical</option>
                        <option value="True/False">True/False</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Subject</label>
                      <input type="text" value={editingData?.subject || ''} onChange={e => setEditingData({...editingData, subject: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Topic</label>
                      <input type="text" value={editingData?.topic || ''} onChange={e => setEditingData({...editingData, topic: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Question Text</label>
                    <textarea rows={4} value={editingData?.question_text || ''} onChange={e => setEditingData({...editingData, question_text: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 resize-none" />
                  </div>

                  {(editingData?.question_type === 'MCQ' || editingData?.question_type === 'MSQ') && (
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Options</label>
                      <div className="space-y-3">
                        {editingData?.options?.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="p-2.5 bg-white/10 rounded-xl font-bold">{String.fromCharCode(65 + i)}</span>
                            <input type="text" value={opt} onChange={e => {
                              const newOpts = [...(editingData.options || [])];
                              newOpts[i] = e.target.value;
                              setEditingData({...editingData, options: newOpts});
                            }} className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5" />
                            <button onClick={() => {
                              const newOpts = editingData.options?.filter((_, idx) => idx !== i);
                              setEditingData({...editingData, options: newOpts});
                            }} className="p-2 hover:bg-white/10 rounded-xl text-red-400"><X className="w-5 h-5"/></button>
                          </div>
                        ))}
                        <button onClick={() => setEditingData({...editingData, options: [...(editingData?.options || []), '']})} className="text-[#5CE1E6] text-sm font-medium">+ Add Option</button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Correct Answer(s)</label>
                    <input type="text" value={editingData?.correct_answer || ''} onChange={e => setEditingData({...editingData, correct_answer: e.target.value})} placeholder="e.g. A or A,C or 42" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5" />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Explanation</label>
                    <textarea rows={3} value={editingData?.explanation || ''} onChange={e => setEditingData({...editingData, explanation: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Review Status</label>
                      <select value={editingData?.review_status || ''} onChange={e => setEditingData({...editingData, review_status: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5">
                        <option value="pending_review">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="needs_edit">Needs Edit</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Source Type</label>
                      <select value={editingData?.source_type || ''} onChange={e => setEditingData({...editingData, source_type: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5">
                        <option value="manual">Manual</option>
                        <option value="ai_generated">AI Generated</option>
                        <option value="bulk_import">Bulk Import</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {selectedQuestion?.normalized_hash && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-orange-400 font-bold">Duplicate Warning</h4>
                        <p className="text-orange-400/80 text-sm mt-1">This question might be a duplicate based on text similarity.</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex gap-2 mb-4">
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs">{selectedQuestion?.exam}</span>
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs">{selectedQuestion?.subject}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${getTypeColor(selectedQuestion?.question_type || '')}`}>{selectedQuestion?.question_type}</span>
                    </div>
                    <h3 className="text-lg font-medium whitespace-pre-wrap">{selectedQuestion?.question_text}</h3>
                  </div>

                  {selectedQuestion?.options && selectedQuestion.options.length > 0 && (
                    <div className="space-y-3">
                      {selectedQuestion.options.map((opt, i) => {
                        const isCorrect = selectedQuestion.correct_answer?.includes(String.fromCharCode(65 + i));
                        return (
                          <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'} flex items-center gap-4`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-white/10'}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(!selectedQuestion?.options || selectedQuestion.options.length === 0) && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-white/60 text-sm block mb-1">Correct Answer</span>
                      <span className="font-bold text-lg">{selectedQuestion?.correct_answer}</span>
                    </div>
                  )}

                  {selectedQuestion?.explanation && (
                    <div>
                      <h4 className="font-bold mb-2">Explanation</h4>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl whitespace-pre-wrap text-white/80">
                        {selectedQuestion.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {editMode && (
              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                <button onClick={() => setEditMode(false)} className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[#5CE1E6] text-[#062B3D] font-bold hover:bg-[#5CE1E6]/90 transition-colors">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
