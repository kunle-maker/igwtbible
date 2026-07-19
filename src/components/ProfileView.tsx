import React, { useState } from 'react';
import { 
  Heart, Bookmark, FileText, Download, BarChart2, History, Settings, 
  Trash2, ChevronRight, Edit2, Plus, Calendar, Flame, Award, Trash, Check, Info, Share2, Sparkles, AlertTriangle, Search
} from 'lucide-react';
import { Highlight, Bookmark as BookmarkType, Note, ReadingHistoryItem, StreakState, AppSettings } from '../types';
import { TRANSLATIONS } from '../data/bibleBooks';

interface ProfileViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  highlights: Highlight[];
  onDeleteHighlight: (id: string) => void;
  onUpdateHighlightColor: (id: string, color: Highlight['color']) => void;
  bookmarks: BookmarkType[];
  onDeleteBookmark: (id: string) => void;
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  history: ReadingHistoryItem[];
  onClearHistory: () => void;
  streak: StreakState;
  onNavigateToVerse: (book: string, chapter: number, verseNum?: number) => void;
  downloads: string[];
  onUpdateDownloads: (downloads: string[]) => void;
  user?: { id: string; name: string; email: string } | null;
  onLogin?: (userData: { id: string; name: string; email: string }) => void;
  onLogout?: () => void;
  completedChapters?: { book: string; chapter: number }[];
}

type ProfileTab = 'highlights' | 'bookmarks' | 'notes' | 'downloads' | 'stats' | 'history' | 'settings';

export default function ProfileView({
  settings,
  onUpdateSettings,
  highlights,
  onDeleteHighlight,
  onUpdateHighlightColor,
  bookmarks,
  onDeleteBookmark,
  notes,
  onSaveNote,
  onDeleteNote,
  history,
  onClearHistory,
  streak,
  onNavigateToVerse,
  downloads,
  onUpdateDownloads,
  user = null,
  onLogin = () => {},
  onLogout = () => {},
  completedChapters = []
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('stats');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteSearchText, setNoteSearchText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword, name: authName };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      if (data.user) {
        onLogin(data.user);
        setAuthMode(null);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Group highlights by date
  const getGroupedHighlights = () => {
    const groups: { [key: string]: Highlight[] } = {};
    highlights.forEach((h) => {
      const dateStr = new Date(h.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(h);
    });
    return groups;
  };

  const groupedHighlights = getGroupedHighlights();

  // Export data as JSON file
  const handleExportData = () => {
    const dataStr = JSON.stringify({
      notes,
      highlights,
      bookmarks,
      streak,
      settings
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'igwt_bible_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Toggle download/delete simulation of translation packages
  const handleToggleDownload = (translationId: string) => {
    if (downloads.includes(translationId)) {
      if (translationId === 'KJV' || translationId === 'NKJV') {
        alert('Core translations (KJV and NKJV) cannot be removed.');
        return;
      }
      onUpdateDownloads(downloads.filter((id) => id !== translationId));
    } else {
      onUpdateDownloads([...downloads, translationId]);
    }
  };

  // Note save trigger
  const handleSaveNoteEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote) {
      onSaveNote(editingNote);
      setEditingNote(null);
    }
  };

  // Filter notes by search text
  const filteredNotes = notes.filter((n) => 
    n.text.toLowerCase().includes(noteSearchText.toLowerCase()) || 
    n.book.toLowerCase().includes(noteSearchText.toLowerCase()) || 
    n.verseRef.toLowerCase().includes(noteSearchText.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto" id="profile-tab-content">
      {/* Upper profile header banner */}
      <div className="pt-6 px-4 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-zinc-100">
            Workspace
          </h1>
          <p className="font-sans text-xs text-zinc-500 mt-1">My offline logs, statistics, and customization</p>
        </div>
        <img 
          src="https://i.ibb.co/NRBK22V/jawadmd.jpg" 
          alt="IGWT Logo" 
          className="w-12 h-12 rounded-2xl object-cover border border-[#D4AF37]/30 shadow-md"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Premium Corporate Cloud Sync & Auth Banner */}
      <div className="px-4 animate-fade-in">
        {user ? (
          /* Logged In */
          <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/10 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud Sync Active
              </span>
              <p className="text-xs font-bold font-sans text-zinc-100">{user.name}</p>
              <p className="text-[10px] font-sans text-zinc-500">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold font-sans tracking-tight transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Logged Out */
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900/60 shadow-sm space-y-3">
            {!authMode ? (
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-gold-500 tracking-wider">
                    Cloud Storage Offline
                  </span>
                  <p className="text-xs font-bold text-zinc-200 leading-tight font-sans">Sync stats, highlights, and notes.</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#AA8B1E] text-black text-[10px] font-extrabold font-sans tracking-tight transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold font-sans tracking-tight transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                  <span className="text-[10px] uppercase font-mono font-bold text-gold-500 tracking-wider">
                    {authMode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode(null)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>

                {authError && (
                  <p className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium leading-tight font-sans">
                    {authError}
                  </p>
                )}

                <div className="space-y-2">
                  {authMode === 'signup' && (
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-gold-500/40 font-sans"
                      required
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-gold-500/40 font-sans"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-gold-500/40 font-sans"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setAuthError('');
                    }}
                    className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 underline font-sans"
                  >
                    {authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#AA8B1E] text-black text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {authLoading ? 'Verifying...' : authMode === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Tabs list - Premium slideable grid */}
      <div className="px-4">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none snap-x border-b border-zinc-900">
          {(
            [
              { id: 'stats', label: 'Stats', icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
              { id: 'highlights', label: 'Colors', icon: <Heart className="w-4 h-4" /> },
              { id: 'bookmarks', label: 'Saves', icon: <Bookmark className="w-4 h-4" /> },
              { id: 'downloads', label: 'Offline', icon: <Download className="w-4 h-4" /> },
              { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
              { id: 'settings', label: 'Config', icon: <Settings className="w-4 h-4" /> }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingNote(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold rounded-t-2xl transition-all flex-shrink-0 snap-start border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Workspace Container */}
      <div className="px-4">
        
        {/* STATS VIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Bento statistics grids */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20 mb-2" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">Streak Record</span>
                <span className="font-sans text-2xl font-bold text-zinc-100">{streak.longestStreak} days</span>
              </div>
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md">
                <Award className="w-5 h-5 text-gold-400 mb-2" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">Total Read</span>
                <span className="font-sans text-2xl font-bold text-zinc-100">{history.length} Chapters</span>
              </div>
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md">
                <FileText className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">Total Notes</span>
                <span className="font-sans text-2xl font-bold text-zinc-100">{notes.length} Notes</span>
              </div>
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md">
                <Heart className="w-5 h-5 text-rose-400 mb-2" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">Highlights</span>
                <span className="font-sans text-2xl font-bold text-zinc-100">{highlights.length} Verses</span>
              </div>
            </div>

            {/* Streak Calendar mock visual */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="font-sans font-semibold text-sm text-zinc-300">Daily Reading Habits</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{streak.daysRead.length} active days</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex flex-wrap gap-1.5 justify-center">
                {Array.from({ length: 28 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (27 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const hasRead = streak.daysRead.includes(dateStr);
                  return (
                    <div 
                      key={i} 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-medium transition-all ${
                        hasRead 
                          ? 'bg-gold-500/15 border-gold-500/30 text-gold-400' 
                          : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                      }`}
                      title={d.toLocaleDateString()}
                    >
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completed Chapters list */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-sans font-semibold text-sm text-zinc-300">Completed Chapters</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{completedChapters?.length || 0} read</span>
              </div>
              
              {(!completedChapters || completedChapters.length === 0) ? (
                <p className="text-zinc-500 text-xs text-center py-2 font-sans">
                  No completed chapters marked yet. Mark them in the reader!
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {completedChapters.map((c, idx) => (
                    <span 
                      key={idx}
                      onClick={() => onNavigateToVerse(c.book, c.chapter)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono tracking-tight cursor-pointer hover:bg-emerald-500/20 transition-all select-none"
                    >
                      {c.book} {c.chapter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTES VIEW */}
        {activeTab === 'notes' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {editingNote ? (
              /* Notes Editor Form */
              <form onSubmit={handleSaveNoteEdit} className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <h4 className="font-sans font-bold text-sm text-gold-400">Edit Note for {editingNote.book} {editingNote.chapter}:{editingNote.verseNum}</h4>
                  <button 
                    type="button" 
                    onClick={() => setEditingNote(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={editingNote.text}
                  onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                  placeholder="Type your notes here..."
                  className="w-full h-32 p-4 bg-zinc-900/50 border border-zinc-850 rounded-2xl text-zinc-200 focus:outline-none focus:border-gold-500/30 text-sm font-sans resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-600 text-black text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95"
                >
                  Save Note
                </button>
              </form>
            ) : (
              /* Notes list */
              <div className="space-y-4">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Search my notes..."
                    value={noteSearchText}
                    onChange={(e) => setNoteSearchText(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-gold-500/30 rounded-2xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2.5">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                      <div key={note.id} className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-3 shadow-md">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => onNavigateToVerse(note.book, note.chapter, note.verseNum)}
                            className="font-sans font-bold text-sm text-gold-400 text-left hover:text-gold-300 transition-colors"
                          >
                            {note.book} {note.chapter}:{note.verseNum}
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingNote(note)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
                              title="Edit Note"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteNote(note.id)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="font-sans text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/40">
                          {note.text}
                        </p>
                        <span className="block font-mono text-[8px] text-zinc-600 text-right">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="font-sans text-xs text-zinc-500">No notes found. Long press any verse inside the Bible page to add your personal notes offline!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HIGHLIGHTS VIEW */}
        {activeTab === 'highlights' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {highlights.length > 0 ? (
              <div className="space-y-6">
                {Object.keys(groupedHighlights).map((date) => (
                  <div key={date} className="space-y-3">
                    <span className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest font-semibold block px-1">
                      {date}
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {groupedHighlights[date].map((h) => (
                        <div key={h.id} className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-2 flex gap-4 shadow-md">
                          <div className="w-1.5 self-stretch rounded-full" style={{
                            backgroundColor: 
                              h.color === 'yellow' ? '#f59e0b' : 
                              h.color === 'blue' ? '#3b82f6' : 
                              h.color === 'green' ? '#10b981' : 
                              h.color === 'pink' ? '#ec4899' : '#f97316'
                          }} />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <button
                                onClick={() => onNavigateToVerse(h.book, h.chapter, h.verseNum)}
                                className="font-sans font-bold text-xs text-gold-400 hover:text-gold-300 transition-colors"
                              >
                                {h.book} {h.chapter}:{h.verseNum}
                              </button>
                              <div className="flex items-center gap-1.5">
                                {/* Small color switches */}
                                {(['yellow', 'blue', 'green', 'pink', 'orange'] as Highlight['color'][]).map((col) => (
                                  <button
                                    key={col}
                                    onClick={() => onUpdateHighlightColor(h.id, col)}
                                    className={`w-2 h-2 rounded-full border ${h.color === col ? 'scale-125 border-zinc-300' : 'border-transparent'}`}
                                    style={{
                                      backgroundColor: 
                                        col === 'yellow' ? '#f59e0b' : 
                                        col === 'blue' ? '#3b82f6' : 
                                        col === 'green' ? '#10b981' : 
                                        col === 'pink' ? '#ec4899' : '#f97316'
                                    }}
                                  />
                                ))}
                                <button
                                  onClick={() => onDeleteHighlight(h.id)}
                                  className="p-1 text-zinc-600 hover:text-rose-400 rounded-lg transition-colors ml-1.5"
                                  title="Delete highlight"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="font-serif text-xs text-zinc-400 italic">
                              “Scripture highlighted with custom indicator.”
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Heart className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="font-sans text-xs text-zinc-500">No highlighted verses found. Long press any verse inside the Bible page to color-tag it.</p>
              </div>
            )}
          </div>
        )}

        {/* BOOKMARKS VIEW */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {bookmarks.length > 0 ? (
              <div className="space-y-1.5">
                {bookmarks.map((b) => (
                  <div key={b.id} className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-between shadow-sm hover:border-zinc-800 transition-colors">
                    <button
                      onClick={() => onNavigateToVerse(b.book, b.chapter, b.verseNum)}
                      className="flex items-center gap-3 text-left group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-gold-400">
                        <Bookmark className="w-4 h-4 fill-gold-400" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-sans font-bold text-xs text-zinc-200 group-hover:text-gold-400 transition-colors">
                          {b.book} {b.chapter}:{b.verseNum}
                        </span>
                        <span className="block font-mono text-[8px] text-zinc-600">
                          Saved {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(b.id)}
                      className="p-2 text-zinc-600 hover:text-rose-400 rounded-xl hover:bg-zinc-900 transition-all active:scale-90"
                      title="Delete Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="font-sans text-xs text-zinc-500">No saved scriptures found. Long press any verse inside the Bible page to Bookmark it.</p>
              </div>
            )}
          </div>
        )}

        {/* DOWNLOADS VIEW */}
        {activeTab === 'downloads' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 flex gap-3">
              <Info className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                Downloaded translations are indexed and fully functional in <span className="font-semibold text-zinc-200">Offline Mode</span>. Toggle packages below to simulate local storage management.
              </p>
            </div>

            <div className="space-y-2">
              {TRANSLATIONS.map((trans) => {
                const isDownloaded = downloads.includes(trans.id);
                return (
                  <div key={trans.id} className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-between shadow-sm">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-sm text-zinc-200">{trans.id}</span>
                        <span className="text-[10px] text-zinc-500 font-sans">• {trans.name}</span>
                      </div>
                      <p className="font-sans text-[10px] text-zinc-600">{trans.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleDownload(trans.id)}
                      className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer ${
                        isDownloaded
                          ? 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          : 'bg-gold-500 hover:bg-gold-600 text-black shadow-md'
                      }`}
                    >
                      {isDownloaded ? 'Delete Package' : 'Download Offline'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {history.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest font-semibold">Recently Read</span>
                  <button
                    onClick={onClearHistory}
                    className="font-sans text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Clear History
                  </button>
                </div>
                <div className="space-y-1.5">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigateToVerse(item.book, item.chapter)}
                      className="w-full p-4 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-between hover:border-zinc-850 transition-colors shadow-sm text-left group cursor-pointer"
                    >
                      <div className="space-y-1">
                        <h4 className="font-sans font-bold text-xs text-zinc-200 group-hover:text-gold-400 transition-colors">
                          {item.book} {item.chapter}
                        </h4>
                        <span className="block font-mono text-[9px] text-zinc-500">
                          {item.translation} • {new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-gold-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <History className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="font-sans text-xs text-zinc-500">No reading history logged yet.</p>
              </div>
            )}
          </div>
        )}

        {/* CONFIG / SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Customizer Slider Settings */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4 shadow-md">
              <span className="font-mono text-[9px] uppercase tracking-widest text-gold-500 font-bold block">Scripture Layout</span>
              
              {/* Font Size Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium font-sans">Font Size</span>
                  <span className="text-zinc-200 font-mono font-bold">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="30"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                  className="w-full accent-gold-500 bg-zinc-800 rounded-lg appearance-none h-1.5"
                />
              </div>

              {/* Line Spacing Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium font-sans">Line Spacing</span>
                  <span className="text-zinc-200 font-mono font-bold">{settings.lineSpacing}x</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.4"
                  step="0.2"
                  value={settings.lineSpacing}
                  onChange={(e) => onUpdateSettings({ ...settings, lineSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-gold-500 bg-zinc-800 rounded-lg appearance-none h-1.5"
                />
              </div>

              {/* Reading Goals Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium font-sans">Daily Chapter Goal</span>
                  <span className="text-zinc-200 font-mono font-bold">{settings.readingGoal} ch</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.readingGoal}
                  onChange={(e) => onUpdateSettings({ ...settings, readingGoal: parseInt(e.target.value) })}
                  className="w-full accent-gold-500 bg-zinc-800 rounded-lg appearance-none h-1.5"
                />
              </div>
            </div>

            {/* Notifications settings */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4 shadow-md">
              <span className="font-mono text-[9px] uppercase tracking-widest text-gold-500 font-bold block">Local Reminders</span>
              
              <div className="space-y-3.5">
                {[
                  { id: 'dailyVerse', label: 'Daily Verse Notification', desc: 'Encouraging morning scriptures' },
                  { id: 'dailyPrayer', label: 'Daily Prayer Notification', desc: 'Noontime spiritual prayers' },
                  { id: 'readingReminder', label: 'Evening Reading Reminder', desc: 'Keep up your scripture reading streak' }
                ].map((notif) => {
                  const key = notif.id as keyof AppSettings['notifications'];
                  return (
                    <div key={notif.id} className="flex items-center justify-between">
                      <div className="space-y-0.5 pr-4">
                        <label className="text-xs font-bold text-zinc-200 block font-sans">{notif.label}</label>
                        <span className="text-[10px] text-zinc-500 block font-sans">{notif.desc}</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = { ...settings.notifications };
                          updated[key] = !updated[key];
                          onUpdateSettings({ ...settings, notifications: updated });
                        }}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${settings.notifications[key] ? 'bg-gold-500' : 'bg-zinc-800'}`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform ${settings.notifications[key] ? 'translate-x-4.5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Backups / Actions */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4 shadow-md">
              <span className="font-mono text-[9px] uppercase tracking-widest text-gold-500 font-bold block">Data Management</span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportData}
                  className="py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Backup</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your local logs, highlights, and history? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset App</span>
                </button>
              </div>
            </div>

            {/* About Page Prominent Presentation */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-[#D4AF37]/20 shadow-xl text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
              <img 
                src="https://i.ibb.co/NRBK22V/jawadmd.jpg" 
                alt="IGWT Logo" 
                className="w-16 h-16 rounded-2xl mx-auto border border-gold-500/30 shadow-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h3 className="font-sans font-extrabold text-lg text-zinc-100">IGWT Bible</h3>
                <p className="font-sans text-xs text-gold-400 font-medium tracking-wide">"In God We Trust"</p>
                <p className="font-sans text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Version 1.0.0</p>
              </div>

              <p className="font-sans text-xs text-zinc-400 leading-relaxed px-2">
                A highly-polished, responsive offline scripture reader designed for deep reading, reflection, and daily devotion. Created for the body of Christ.
              </p>

              <div className="border-t border-zinc-900 pt-4 space-y-1 text-xs">
                <p className="text-zinc-500 font-sans">Developed by <span className="text-zinc-300 font-bold">Ayokunle</span></p>
                <p className="text-zinc-500 font-sans">Portfolio: <a href="https://ayox.my.id" target="_blank" rel="noreferrer" className="text-gold-400 hover:underline font-semibold">ayox.my.id</a></p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
