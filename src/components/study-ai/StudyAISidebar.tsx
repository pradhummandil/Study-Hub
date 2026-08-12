import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession } from '../../types/study-ai';
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  ChevronRight,
  Brain,
} from 'lucide-react';

interface StudyAISidebarProps {
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
  onClearAllChats: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function StudyAISidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onClearAllChats,
  isOpenMobile,
  onCloseMobile,
}: StudyAISidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Filter chats by search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.exam && c.exam.toLowerCase().includes(q)) ||
        (c.mode && c.mode.toLowerCase().includes(q))
    );
  }, [chats, searchQuery]);

  // Group chats by date
  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: {
      today: ChatSession[];
      yesterday: ChatSession[];
      previous7Days: ChatSession[];
      older: ChatSession[];
    } = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    filteredChats.forEach((chat) => {
      const time = new Date(chat.updatedAt).getTime();
      if (time >= today) {
        groups.today.push(chat);
      } else if (time >= yesterday) {
        groups.yesterday.push(chat);
      } else if (time >= sevenDaysAgo) {
        groups.previous7Days.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  const handleStartRename = (chat: ChatSession) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const renderChatGroup = (title: string, groupChats: ChatSession[]) => {
    if (groupChats.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
          {title}
        </p>
        <div className="space-y-1">
          {groupChats.map((chat) => {
            const isSelected = chat.id === currentChatId;
            const isEditing = editingChatId === chat.id;

            return (
              <div key={chat.id} className="relative group">
                {isEditing ? (
                  <div className="px-2 py-1.5 flex items-center gap-1.5 bg-white/10 rounded-xl">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(chat.id)}
                      autoFocus
                      className="w-full bg-transparent text-xs text-white px-2 py-1 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(chat.id)}
                      className="text-xs px-2 py-1 bg-[#5CE1E6] text-[#062B3D] font-medium rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      onSelectChat(chat.id);
                      onCloseMobile();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[rgba(92,225,230,0.15)] to-[rgba(124,131,253,0.15)] text-white border border-[#5CE1E6]/30 font-medium'
                        : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 pr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: isSelected ? '#5CE1E6' : 'rgba(255,255,255,0.4)' }} />
                      <div className="truncate">
                        <p className="truncate text-xs font-normal leading-snug">{chat.title}</p>
                        {chat.exam && chat.exam !== 'General' && (
                          <span className="text-[9px] text-[#5CE1E6]/80 font-medium">{chat.exam}</span>
                        )}
                      </div>
                    </div>

                    {/* Context menu trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white transition-opacity rounded-md hover:bg-white/10"
                      aria-label="Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Context menu popup */}
                    {activeMenuId === chat.id && (
                      <div
                        className="absolute right-2 top-full mt-1 z-50 w-32 rounded-xl bg-[#062B3D]/95 border border-white/15 backdrop-blur-xl shadow-2xl py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleStartRename(chat)}
                          className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Rename
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmId(chat.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden">
      {/* Header + New Chat Button */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" style={{ color: '#5CE1E6' }} />
            <span className="text-xs font-semibold text-white tracking-wide">Study Sessions</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden text-white/40 hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #5CE1E6 0%, #7C83FD 100%)',
            color: '#062B3D',
            boxShadow: '0 4px 16px rgba(92,225,230,0.25)',
          }}
          id="new-chat-btn"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New study session</span>
        </button>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#5CE1E6]/40 transition-colors"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-xs">
            No study sessions yet.<br />Start a new conversation!
          </div>
        ) : (
          <>
            {renderChatGroup('Today', groupedChats.today)}
            {renderChatGroup('Yesterday', groupedChats.yesterday)}
            {renderChatGroup('Previous 7 Days', groupedChats.previous7Days)}
            {renderChatGroup('Older', groupedChats.older)}
          </>
        )}
      </div>

      {/* Footer Clear All button */}
      {chats.length > 0 && (
        <div className="shrink-0 pt-3 mt-2 border-t border-white/5">
          <button
            onClick={() => setShowClearAllModal(true)}
            className="w-full text-left px-3 py-2 text-[11px] text-white/40 hover:text-red-400 transition-colors flex items-center justify-between"
          >
            <span>Clear all chat history</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
          </button>
        </div>
      )}

      {/* Delete Single Chat Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#062B3D] border border-white/15 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Delete this conversation?</h4>
              <p className="text-xs text-white/60 mb-5">
                This action cannot be undone and will permanently remove this study chat.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteChat(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearAllModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#062B3D] border border-red-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Delete every StudyMate conversation?</h4>
              <p className="text-xs text-white/60 mb-5">
                This will permanently erase all your saved study history. This cannot be undone.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllChats();
                    setShowClearAllModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Clear all history
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className="hidden md:flex flex-col shrink-0 w-64 h-full border-r border-white/5 relative z-20"
        style={{
          background: 'rgba(6, 43, 61, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay on small screens) */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-[200] md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-72 h-full bg-[#062B3D] border-r border-white/10 shadow-2xl flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
