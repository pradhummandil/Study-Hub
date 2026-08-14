import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users, MessageSquare, Plus, Search,
  CheckCircle2, Heart, Sparkles, X, Send, Flag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentContext } from '../context/StudentContext';
import {
  fetchStudyCircles,
  toggleCircleMembership,
  fetchCommunityPosts,
  createCommunityPost,
  fetchPostComments,
  addPostComment,
  markHelpfulAnswer,
  togglePostReaction
} from '../lib/community/communityApi';
import { submitReport } from '../lib/community/moderation';
import type { StudyCircle, CommunityPost, CommunityComment, PostType } from '../types/ecosystem';

export default function Community() {
  const { user } = useAuth();
  const { targetExam, subjects: userSubjects } = useStudentContext();

  const [circles, setCircles] = useState<StudyCircle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<StudyCircle | null>(null);

  // Feed state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_exam' | 'for_you' | 'my_subjects' | 'following' | 'latest' | 'explore_all'>('my_exam');
  const [postTypeFilter, setPostTypeFilter] = useState<PostType | 'all' | 'unanswered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('question');
  const [postError, setPostError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Active Post Detail Modal
  const [activePost, setActivePost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);
  const [reportReason, setReportReason] = useState<'Spam' | 'Harassment' | 'Inappropriate' | 'Misleading academic information' | 'Copyright concern' | 'Other'>('Spam');
  const [reportDetails, setReportDetails] = useState('');

  const handleOpenReportModal = (type: 'post' | 'comment', id: string) => {
    setReportTarget({ type, id });
    setShowReportModal(true);
  };

  // Load circles on mount or targetExam change
  useEffect(() => {
    let isMounted = true;
    async function loadCircles() {
      const data = await fetchStudyCircles(user?.id);
      if (isMounted) {
        // Prioritize circles matching active exam
        const sorted = [...data].sort((a, b) => {
          if (a.exam === targetExam && b.exam !== targetExam) return -1;
          if (a.exam !== targetExam && b.exam === targetExam) return 1;
          return 0;
        });
        setCircles(sorted);
        if (sorted.length > 0) setSelectedCircle(sorted[0]);
      }
    }
    loadCircles();
    return () => { isMounted = false; };
  }, [user, targetExam]);

  // Load posts when circle/tab/search changes
  useEffect(() => {
    let isMounted = true;
    async function loadPosts() {
      setLoadingPosts(true);
      const data = await fetchCommunityPosts({
        circleId: selectedCircle?.id,
        type: postTypeFilter === 'unanswered' ? 'question' : (postTypeFilter as any),
        unansweredOnly: postTypeFilter === 'unanswered',
        searchQuery,
        userId: user?.id,
      });

      if (isMounted) {
        let filtered = data;
        if (activeTab === 'my_exam') {
          filtered = data.filter((p) => !p.exam || p.exam === targetExam);
        } else if (activeTab === 'my_subjects') {
          filtered = data.filter((p) => userSubjects.some((s) => p.title.toLowerCase().includes(s.toLowerCase()) || p.content.toLowerCase().includes(s.toLowerCase())));
        } else if (activeTab === 'following') {
          filtered = data.filter((p) => (p as any).is_member);
        }

        setPosts(filtered);
        setLoadingPosts(false);
      }
    }
    loadPosts();
    return () => { isMounted = false; };
  }, [selectedCircle, activeTab, postTypeFilter, searchQuery, user, targetExam, userSubjects]);

  const handleJoinToggle = async (circle: StudyCircle) => {
    if (!user) return;
    const nextMemberState = !circle.is_member;
    setCircles((prev) =>
      prev.map((c) => (c.id === circle.id ? { ...c, is_member: nextMemberState, member_count: c.member_count + (nextMemberState ? 1 : -1) } : c))
    );
    if (selectedCircle?.id === circle.id) {
      setSelectedCircle((prev) => prev ? { ...prev, is_member: nextMemberState } : null);
    }
    await toggleCircleMembership(user.id, circle.id, nextMemberState);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsPosting(true);
    setPostError(null);

    const res = await createCommunityPost({
      userId: user.id,
      circleId: selectedCircle?.id,
      type: newPostType,
      title: newTitle,
      content: newContent,
      exam: selectedCircle?.exam || 'GATE',
    });

    setIsPosting(false);
    if (!res.success) {
      setPostError(res.error || 'Failed to create post.');
    } else {
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      if (res.post) setPosts((prev) => [res.post!, ...prev]);
    }
  };

  const handleOpenPostDetails = async (post: CommunityPost) => {
    setActivePost(post);
    const comms = await fetchPostComments(post.id);
    setComments(comms);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activePost || !newComment.trim()) return;

    const res = await addPostComment(activePost.id, user.id, newComment);
    if (!res.success) {
      setCommentError(res.error || 'Failed to add comment.');
    } else {
      setNewComment('');
      setCommentError(null);
      if (res.comment) setComments((prev) => [...prev, res.comment!]);
    }
  };

  const handleMarkHelpful = async (comment: CommunityComment) => {
    if (!user || !activePost) return;
    await markHelpfulAnswer(comment.id, activePost.id, comment.user_id);
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, is_helpful: true } : c)));
    setActivePost((prev) => prev ? { ...prev, is_answered: true } : null);
  };

  const handleReaction = async (postId: string, type: 'helpful' | 'like') => {
    if (!user) return;
    await togglePostReaction(user.id, postId, type);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          like_count: type === 'like' ? p.like_count + 1 : p.like_count,
          helpful_count: type === 'helpful' ? p.helpful_count + 1 : p.helpful_count,
        };
      })
    );
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportTarget) return;

    await submitReport({
      reporter_id: user.id,
      target_type: reportTarget.type,
      target_id: reportTarget.id,
      reason: reportReason,
      details: reportDetails,
    });

    setShowReportModal(false);
    setReportDetails('');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D]">
      <Helmet>
        <title>Study Circles & Peer Doubts — Study Hub</title>
        <meta name="description" content="Academic study circles, peer doubts, verified answers, and quiet collaborative study groups." />
      </Helmet>

      {/* Hero Header */}
      <div className="relative z-10 px-6 pt-10 pb-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2D5A3F]/10 border border-[#2D5A3F]/20 text-[#2D5A3F] text-xs font-mono mb-3">
          <Users className="w-3.5 h-3.5" /> Academic Peer Community
        </div>
        <h1
          className="text-4xl sm:text-5xl font-serif font-bold text-[#1C201D] tracking-tight"
        >
          Study Circles & <span className="text-[#C86D51]">Peer Doubts.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6C706D] max-w-xl mx-auto mt-2 leading-relaxed font-sans">
          Focused academic discussions, PYQ doubt resolution, and study resources. Free of social noise.
        </p>

        {/* Video Frame */}
        <div className="mt-4 mx-auto max-w-[200px] rounded-2xl overflow-hidden border border-[#1C201D]/10 shadow-lg bg-[#1C201D] aspect-square max-h-[160px] flex items-center justify-center">
          <video
            src="/assets/pinterest/actual-pin-53972895522938608.mp4"
            poster="/assets/pinterest/actual-pin-53972895522938608-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      </div>

      {/* Main Layout: Left Circles Sidebar + Right Feed */}
      <div className="relative z-10 px-6 max-w-6xl mx-auto pb-28 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Study Circles List */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#6C706D] font-bold px-2">
            Study Circles
          </h2>

          <div className="space-y-2">
            {circles.map((c) => {
              const isSelected = selectedCircle?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCircle(c)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#2D5A3F] border-[#2D5A3F] shadow-md text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] border-[#1C201D]/10 text-[#1C201D] hover:border-[#2D5A3F]/30 hover:bg-[#EDE8DB]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-serif font-bold ${isSelected ? 'text-[#FFFFFF]' : 'text-[#1C201D]'}`}>
                      {c.name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#D4AF37]' : 'text-[#2D5A3F]'}`}>
                      {c.member_count} members
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-[#EDE8DB]' : 'text-[#6C706D]'}`}>
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Circle Header, Controls, Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Selected Circle Banner */}
          {selectedCircle && (
            <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#1C201D]/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A3F] px-2.5 py-0.5 rounded-full bg-[#2D5A3F]/10 border border-[#2D5A3F]/20">
                    {selectedCircle.exam}
                  </span>
                  <span className="text-xs text-[#6C706D]">• {selectedCircle.member_count} learners active</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C201D] leading-tight">{selectedCircle.name}</h2>
                <p className="text-xs text-[#6C706D] mt-1 max-w-xl">{selectedCircle.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleJoinToggle(selectedCircle)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCircle.is_member
                      ? 'bg-[#EDE8DB] text-[#1C201D] border border-[#1C201D]/10 hover:bg-[#C86D51]/20 hover:text-[#C86D51]'
                      : 'bg-[#2D5A3F] text-[#FFFFFF] shadow-sm hover:bg-[#2D5A3F]/90'
                  }`}
                >
                  {selectedCircle.is_member ? 'Joined Circle ✓' : 'Join Circle'}
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#C86D51] hover:bg-[#C86D51]/90 text-[#FFFFFF] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Ask Question
                </button>
              </div>
            </div>
          )}

          {/* Personalization Context Tabs & Type Filters */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {[
                { id: 'my_exam', label: `My Exam (${targetExam})` },
                { id: 'for_you', label: 'For You' },
                { id: 'my_subjects', label: 'My Subjects' },
                { id: 'following', label: 'Following' },
                { id: 'latest', label: 'Latest' },
                { id: 'explore_all', label: 'Explore All Exams' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#2D5A3F] text-[#FFFFFF] font-bold border-[#2D5A3F] shadow-sm'
                      : 'bg-[#EDE8DB] text-[#6C706D] hover:text-[#1C201D] border-[#1C201D]/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'question', label: 'Questions' },
                  { id: 'unanswered', label: 'Need Help (Unanswered)' },
                  { id: 'tip', label: 'Tips & Guides' },
                  { id: 'resource_share', label: 'Shared Notes' },
                ].map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => setPostTypeFilter(ft.id as any)}
                    className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                      postTypeFilter === ft.id
                        ? 'bg-[#2D5A3F] text-[#FFFFFF] border-[#2D5A3F]'
                        : 'bg-[#FFFFFF] text-[#6C706D] border-[#1C201D]/10 hover:text-[#1C201D]'
                    }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-60 shrink-0">
                <Search className="w-4 h-4 text-[#6C706D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#1C201D]/15 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C201D] placeholder:text-[#6C706D] focus:outline-none focus:border-[#2D5A3F]"
                />
              </div>
            </div>
          </div>

          {/* Feed Posts List */}
          {loadingPosts ? (
            <div className="py-16 text-center text-xs text-[#6C706D]">
              <div className="w-8 h-8 rounded-full border-2 border-[#2D5A3F] border-t-transparent animate-spin mx-auto mb-2" />
              Loading discussions...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#1C201D]/10 shadow-sm">
              <MessageSquare className="w-8 h-8 text-[#6C706D] mx-auto mb-3" />
              <h3 className="text-xl font-serif font-bold text-[#1C201D] mb-1">Your study circle is quiet right now</h3>
              <p className="text-xs text-[#6C706D] max-w-sm mx-auto mb-6">
                Start the first academic discussion or ask a PYQ doubt.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#2D5A3F] text-[#FFFFFF] rounded-xl px-6 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:bg-[#2D5A3F]/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Start Discussion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#1C201D]/10 hover:border-[#2D5A3F]/30 shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        post.type === 'question' ? 'bg-[#C86D51]/10 text-[#C86D51] border-[#C86D51]/20' : 'bg-[#2D5A3F]/10 text-[#2D5A3F] border-[#2D5A3F]/20'
                      }`}>
                        {post.type}
                      </span>
                      {post.is_answered && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#2D5A3F] text-[#FFFFFF] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Helpful Answer Marked
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6C706D]">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => handleOpenPostDetails(post)}
                      className="text-lg font-serif font-bold text-[#1C201D] hover:text-[#2D5A3F] transition-colors cursor-pointer"
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#6C706D] line-clamp-3 mt-1 leading-relaxed font-sans">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1C201D]/10 text-xs text-[#6C706D]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleReaction(post.id, 'helpful')}
                        className="flex items-center gap-1 text-[#2D5A3F] font-bold hover:text-[#2D5A3F]/80 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{post.helpful_count} Helpful</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post.id, 'like')}
                        className="flex items-center gap-1 text-[#C86D51] font-bold hover:text-[#C86D51]/80 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.like_count}</span>
                      </button>

                      <button
                        onClick={() => handleOpenReportModal('post', post.id)}
                        className="flex items-center gap-1 text-[#6C706D] hover:text-[#C86D51] transition-colors"
                        title="Report content"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenPostDetails(post)}
                      className="text-xs font-bold text-[#1C201D] hover:text-[#2D5A3F] transition-colors"
                    >
                      View Details & Replies →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201D]/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1C201D]/10 pb-3">
              <h3 className="text-lg font-serif font-bold text-[#1C201D]">Ask Question or Share Resource</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-[#6C706D] hover:text-[#1C201D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 rounded-xl bg-[#C86D51]/10 text-[#C86D51] text-xs font-bold border border-[#C86D51]/20">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1C201D] font-bold mb-1">Post Type</label>
                <div className="flex gap-2">
                  {(['question', 'tip', 'resource_share'] as PostType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewPostType(t)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold capitalize ${
                        newPostType === t ? 'bg-[#2D5A3F] text-[#FFFFFF] border-[#2D5A3F]' : 'bg-[#EDE8DB] text-[#6C706D] border-[#1C201D]/10'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#1C201D] font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="What is your doubt or topic?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#1C201D]/15 rounded-xl px-3 py-2 text-xs text-[#1C201D] focus:outline-none focus:border-[#2D5A3F]"
                />
              </div>

              <div>
                <label className="block text-[#1C201D] font-bold mb-1">Details & Context</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete details or PYQ steps..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#1C201D]/15 rounded-xl p-3 text-xs text-[#1C201D] focus:outline-none focus:border-[#2D5A3F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EDE8DB] text-[#1C201D] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] font-bold shadow-sm disabled:opacity-50"
                >
                  {isPosting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST DETAILS MODAL */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201D]/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1C201D]/10 pb-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#2D5A3F]/10 text-[#2D5A3F]">
                {activePost.type}
              </span>
              <button onClick={() => setActivePost(null)} className="p-1 rounded-lg text-[#6C706D] hover:text-[#1C201D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-[#1C201D]">{activePost.title}</h2>
              <p className="text-xs text-[#6C706D] mt-2 whitespace-pre-line leading-relaxed">{activePost.content}</p>
            </div>

            {/* Comments List */}
            <div className="border-t border-[#1C201D]/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-[#1C201D]">Replies & Community Answers ({comments.length})</h4>
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-[#F8F6F0] border border-[#1C201D]/10 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#1C201D]">{c.author_name || 'Community Member'}</span>
                    {c.is_helpful && (
                      <span className="text-[#2D5A3F] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Marked Answer
                      </span>
                    )}
                  </div>
                  <p className="text-[#6C706D]">{c.content}</p>
                  {!c.is_helpful && user && (
                    <button
                      onClick={() => handleMarkHelpful(c)}
                      className="text-[10px] text-[#2D5A3F] font-bold hover:underline pt-1 block"
                    >
                      Mark as helpful answer
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Write a reply or answer..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-[#F8F6F0] border border-[#1C201D]/15 rounded-xl px-3 py-2 text-xs text-[#1C201D] focus:outline-none focus:border-[#2D5A3F]"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </form>
            )}
            {commentError && <p className="text-xs text-[#C86D51] font-bold">{commentError}</p>}
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C201D]/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1C201D]/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#1C201D]">Report Discussion Content</h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-lg text-[#6C706D] hover:text-[#1C201D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1C201D] font-bold mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full bg-[#F8F6F0] border border-[#1C201D]/15 rounded-xl px-3 py-2 text-xs text-[#1C201D]"
                >
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Inappropriate">Inappropriate Content</option>
                  <option value="Misleading academic information">Misleading Academic Information</option>
                  <option value="Copyright concern">Copyright Concern</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1C201D] font-bold mb-1">Additional Information</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this content violates community guidelines..."
                  className="w-full bg-[#F8F6F0] border border-[#1C201D]/15 rounded-xl p-3 text-xs text-[#1C201D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EDE8DB] text-[#1C201D] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C86D51] text-[#FFFFFF] font-bold shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
