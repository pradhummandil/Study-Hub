// src/pages/Community.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users, MessageCircle, MessageSquare, Plus, Search,
  CheckCircle2, Heart, Sparkles, X, Send
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
    <>
      <Helmet>
        <title>Study Circles & Community — Study Hub</title>
        <meta name="description" content="Academic study circles, peer doubts, verified answers, and quiet collaborative study groups." />
      </Helmet>

      {/* Hero Header */}
      <div className="relative z-10 px-6 pt-12 pb-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-4">
          <Users className="w-3.5 h-3.5" /> Academic Community
        </div>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Study Circles & <span className="text-gradient-accent">Peer Doubts.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mt-2 leading-relaxed">
          Focused academic discussions, PYQ doubt resolution, and study resources. Free of social noise.
        </p>
      </div>

      {/* Main Layout: Left Circles Sidebar + Right Feed */}
      <div className="relative z-10 px-6 max-w-6xl mx-auto pb-28 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Study Circles List */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-2">
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
                      ? 'bg-slate-900 border-cyan-500/50 shadow-lg text-foreground'
                      : 'liquid-glass border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-normal text-foreground tracking-wide" style={{ fontFamily: "'Instrument Serif', serif" }}>{c.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{c.member_count} members</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Circle Header, Controls, Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Selected Circle Banner */}
          {selectedCircle && (
            <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    {selectedCircle.exam}
                  </span>
                  <span className="text-xs text-muted-foreground">• {selectedCircle.member_count} learners active</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-normal text-foreground tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{selectedCircle.name}</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">{selectedCircle.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleJoinToggle(selectedCircle)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCircle.is_member
                      ? 'bg-white/10 text-slate-300 border border-white/10 hover:bg-red-500/20 hover:text-red-300'
                      : 'gradient-cta text-slate-950 font-bold'
                  }`}
                >
                  {selectedCircle.is_member ? 'Joined Circle ✓' : 'Join Circle'}
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
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
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                      : 'liquid-glass text-muted-foreground border-white/10 hover:text-foreground'
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
                    className={`px-3 py-1 rounded-lg border transition-all ${
                      postTypeFilter === ft.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>
        </div>

          {/* Feed Posts List */}
          {loadingPosts ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse mx-auto mb-2" />
              Loading discussions...
            </div>
          ) : posts.length === 0 ? (
            <div className="liquid-glass-card rounded-3xl p-12 text-center border border-white/10">
              <MessageSquare className="w-8 h-8 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="text-xl font-normal text-foreground mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Your study circle is quiet right now</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 font-sans">
                Start the first academic discussion or ask a PYQ doubt.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="gradient-cta rounded-full px-6 py-2.5 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Start Discussion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="liquid-glass-card rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        post.type === 'question' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {post.type}
                      </span>
                      {post.is_answered && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Helpful Answer Marked
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => handleOpenPostDetails(post)}
                      className="text-lg sm:text-xl font-normal text-foreground hover:text-cyan-300 transition-colors cursor-pointer"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed font-sans">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleReaction(post.id, 'helpful')}
                        className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{post.helpful_count} Helpful</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post.id, 'like')}
                        className="flex items-center gap-1 hover:text-purple-300 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-purple-400" />
                        <span>{post.like_count}</span>
                      </button>

                      <button
                        onClick={() => handleOpenPostDetails(post)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.comment_count} Answers</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setReportTarget({ type: 'post', id: post.id });
                        setShowReportModal(true);
                      }}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold mb-1">Create Academic Post</h3>
            <p className="text-xs text-muted-foreground mb-4">Posting to {selectedCircle?.name || 'Community'}</p>

            {postError && <p className="text-xs text-red-400 mb-3">{postError}</p>}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value as PostType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="question">Question (PYQ / Concept Doubt)</option>
                  <option value="discussion">Academic Discussion</option>
                  <option value="tip">Study Strategy / Tip</option>
                  <option value="resource">Notes / Resource</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to solve Subnetting CIDR Masking questions?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Details & Question Text</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide context, question steps, or doubts clearly..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
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
                  disabled={isPosting}
                  className="gradient-cta rounded-full px-6 py-2 text-xs text-slate-950 font-bold"
                >
                  {isPosting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Post Details & Comments Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
            <button
              onClick={() => setActivePost(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {activePost.type}
              </span>
              <h2 className="text-xl font-bold text-foreground mt-2">{activePost.title}</h2>
              <p className="text-xs text-slate-300 whitespace-pre-line mt-2 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                {activePost.content}
              </p>
            </div>

            {/* Answers & Comments Section */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Student Answers & Discussion ({comments.length})
              </h3>

              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No responses yet. Be the first to answer!</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                        c.is_helpful
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-100'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-cyan-300">{c.author_name || 'Student'}</span>
                        {c.is_helpful ? (
                          <span className="text-cyan-400 font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Marked as Helpful Answer
                          </span>
                        ) : (
                          user && activePost.user_id === user.id && (
                            <button
                              onClick={() => handleMarkHelpful(c)}
                              className="text-emerald-400 hover:underline text-[10px] font-bold"
                            >
                              ✓ Mark as Helpful Answer
                            </button>
                          )
                        )}
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a clear, academic answer..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="gradient-cta rounded-xl px-4 py-2.5 text-xs font-bold text-slate-950 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Answer
                </button>
              </form>
              {commentError && <p className="text-xs text-red-400">{commentError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold mb-2">Report Content</h3>
            <p className="text-xs text-slate-400 mb-4">Help keep Study Hub safe and academically serious.</p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="Spam">Spam / Advertising</option>
                  <option value="Harassment">Harassment / Abusive behavior</option>
                  <option value="Inappropriate">Inappropriate username or content</option>
                  <option value="Misleading academic information">Misleading academic information</option>
                  <option value="Copyright concern">Copyright concern</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Details (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Additional context for moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
