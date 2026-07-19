import { useState, useEffect } from 'react';
import { Compass, BookOpen, Search, User, Flame, Sparkles, Moon, Map } from 'lucide-react';
import { getApiUrl } from './utils/api';

// Custom Views / Components
import TodayView from './components/TodayView';
import BibleView from './components/BibleView';
import BookSelectorView from './components/BookSelectorView';
import SearchView from './components/SearchView';
import GuidesView from './components/GuidesView';
import ProfileView from './components/ProfileView';
import VerseCardModal from './components/VerseCardModal';

// Storage & Types
import { 
  loadSettings, saveSettings, 
  loadHighlights, saveHighlights, 
  loadBookmarks, saveBookmarks, 
  loadNotes, saveNotes, 
  loadHistory, saveHistory, 
  loadStreak, saveStreak, 
  loadDownloads, saveDownloads, 
  loadLastRead, saveLastRead,
  checkAndUpdateStreak 
} from './utils/storage';
import { Highlight, Bookmark, Note, ReadingHistoryItem, StreakState, AppSettings, Verse } from './types';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'today' | 'bible' | 'search' | 'guides' | 'profile'>('today');

  // Active Reader target (Book and Chapter)
  const [currentBook, setCurrentBook] = useState('John');
  const [currentChapter, setCurrentChapter] = useState(3);
  const [currentVerseNum, setCurrentVerseNum] = useState<number | undefined>(undefined);

  // Application Data States
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [highlights, setHighlights] = useState<Highlight[]>(loadHighlights());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks());
  const [notes, setNotes] = useState<Note[]>(loadNotes());
  const [history, setHistory] = useState<ReadingHistoryItem[]>(loadHistory());
  const [streak, setStreak] = useState<StreakState>(loadStreak());
  const [downloads, setDownloads] = useState<string[]>(loadDownloads());
  const [completedChapters, setCompletedChapters] = useState<{ book: string; chapter: number }[]>(() => {
    try {
      const stored = localStorage.getItem('igwt_completed_chapters');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // User Authentication State
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(() => {
    try {
      const stored = localStorage.getItem('igwt_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Real-time timezone Daily Verse
  const [dailyVerse, setDailyVerse] = useState<{
    reference: string;
    book: string;
    chapter: number;
    verseNum: number;
    text: string;
    translation: string;
  } | null>(null);

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const res = await fetch(getApiUrl(`/api/daily-verse?tz=${encodeURIComponent(tz)}`));
        if (res.ok) {
          const data = await res.json();
          if (data && data.verse) {
            setDailyVerse(data.verse);
          }
        }
      } catch (e) {
        console.error('Failed to fetch daily verse:', e);
      }
    };
    fetchDailyVerse();
  }, []);

  // Theme and Username States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('igwt_theme') as 'light' | 'dark') || 'dark';
  });
  const [userName, setUserName] = useState<string>(() => {
    const storedUser = localStorage.getItem('igwt_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser).name;
      } catch {}
    }
    return localStorage.getItem('igwt_userName') || '';
  });
  const [userIp, setUserIp] = useState<string>('');

  // Handle Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('igwt_theme', nextTheme);
  };

  // Sync theme with body classes
  useEffect(() => {
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
  }, [theme]);

  // Fetch IP for tracking
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) {
          setUserIp(data.ip);
          localStorage.setItem('igwt_user_ip', data.ip);
        }
      })
      .catch((err) => console.log('IP fetch offline fallback:', err));
  }, []);

  // Cached Chapters state (loaded in-memory to simulate speedy offline downloads)
  const [cachedChapters, setCachedChapters] = useState<{ 
    [key: string]: { book: string; chapter: number; translation: string; verses: Verse[] } 
  }>({});

  // Overlay states
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);
  const [shareVerse, setShareVerse] = useState<{ text: string; book: string; chapter: number; verseNum: number; translation: string } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 1. Splash Screen Timer
  useEffect(() => {
    // Load last read chapter targets from storage to preserve session
    const lastRead = loadLastRead();
    setCurrentBook(lastRead.book);
    setCurrentChapter(lastRead.chapter);

    // Load cached chapters catalog from localStorage if they exist
    try {
      const storedCaches = localStorage.getItem('igwt_chapter_caches');
      if (storedCaches) {
        setCachedChapters(JSON.parse(storedCaches));
      }
    } catch (e) {
      console.error('Failed to load local chapter caches', e);
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  // 2. Active Reader Navigation Handler
  const handleNavigateToBible = (book: string, chapter: number, verseNum?: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setCurrentVerseNum(verseNum);
    saveLastRead(book, chapter, verseNum || 1);
    setActiveTab('bible');
    setIsBookSelectorOpen(false);
  };

  // 3. Highlight events
  const handleAddHighlight = (book: string, chapter: number, verseNum: number, color: Highlight['color']) => {
    const newHighlight: Highlight = {
      id: `${book}_${chapter}_${verseNum}_${Date.now()}`,
      book,
      chapter,
      verseNum,
      color,
      createdAt: new Date().toISOString()
    };
    const updated = [newHighlight, ...highlights.filter(h => !(h.book === book && h.chapter === chapter && h.verseNum === verseNum))];
    setHighlights(updated);
    saveHighlights(updated);
  };

  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    saveHighlights(updated);
  };

  const handleUpdateHighlightColor = (id: string, color: Highlight['color']) => {
    const updated = highlights.map((h) => h.id === id ? { ...h, color } : h);
    setHighlights(updated);
    saveHighlights(updated);
  };

  // 4. Bookmark events
  const handleAddBookmark = (book: string, chapter: number, verseNum: number) => {
    const newBookmark: Bookmark = {
      id: `${book}_${chapter}_${verseNum}_${Date.now()}`,
      book,
      chapter,
      verseNum,
      createdAt: new Date().toISOString()
    };
    const updated = [newBookmark, ...bookmarks];
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  const handleBookmarkToggleFromToday = (book: string, chapter: number, verseNum: number) => {
    const existing = bookmarks.find((b) => b.book === book && b.chapter === chapter && b.verseNum === verseNum);
    if (existing) {
      handleDeleteBookmark(existing.id);
    } else {
      handleAddBookmark(book, chapter, verseNum);
    }
  };

  // 5. Notes events
  const handleAddNote = (book: string, chapter: number, verseNum: number, text: string) => {
    const newNote: Note = {
      id: `${book}_${chapter}_${verseNum}_${Date.now()}`,
      book,
      chapter,
      verseNum,
      verseRef: `${book} ${chapter}:${verseNum}`,
      text,
      createdAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
  };

  const handleSaveNote = (note: Note) => {
    const updated = notes.map((n) => n.id === note.id ? note : n);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  // 6. Chapter Caching Events
  const handleCacheChapter = (key: string, data: { book: string; chapter: number; translation: string; verses: Verse[] }) => {
    const updatedCaches = { ...cachedChapters, [key]: data };
    setCachedChapters(updatedCaches);
    try {
      localStorage.setItem('igwt_chapter_caches', JSON.stringify(updatedCaches));
    } catch (e) {
      console.error('Failed to save chapter caches', e);
    }
  };

  // 7. Reading History logger and Streak tracker
  const handleLogHistory = (book: string, chapter: number, translation: string) => {
    // Check if duplicate of last record to avoid logging multiple times on same chapter
    if (history.length > 0 && history[0].book === book && history[0].chapter === chapter && history[0].translation === translation) {
      return;
    }

    const newItem: ReadingHistoryItem = {
      id: `${book}_${chapter}_${translation}_${Date.now()}`,
      book,
      chapter,
      translation,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    saveHistory(updatedHistory);

    // Update Streak state
    const updatedStreak = checkAndUpdateStreak(streak);
    setStreak(updatedStreak);
    saveStreak(updatedStreak);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  // 8. Settings & Downloads
  const handleUpdateSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
  };

  const handleUpdateDownloads = (updated: string[]) => {
    setDownloads(updated);
    saveDownloads(updated);
  };

  // Open Designer Share Modal helper
  const handleOpenShareModal = (verse: { text: string; book: string; chapter: number; verseNum: number; translation: string }) => {
    setShareVerse(verse);
    setIsShareModalOpen(true);
  };

  // 9. Auth and Sync Events
  const handleLogin = async (userData: { id: string; name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('igwt_user', JSON.stringify(userData));
    localStorage.setItem('igwt_userName', userData.name);
    setUserName(userData.name);

    try {
      const res = await fetch(getApiUrl('/api/user/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          highlights,
          bookmarks,
          notes,
          progress: completedChapters
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.highlights) {
          setHighlights(data.highlights);
          saveHighlights(data.highlights);
        }
        if (data.bookmarks) {
          setBookmarks(data.bookmarks);
          saveBookmarks(data.bookmarks);
        }
        if (data.notes) {
          setNotes(data.notes);
          saveNotes(data.notes);
        }
        if (data.progress) {
          const mapped = data.progress.map((p: any) => ({ book: p.book, chapter: p.chapter }));
          setCompletedChapters(mapped);
          localStorage.setItem('igwt_completed_chapters', JSON.stringify(mapped));
        }
      }
    } catch (e) {
      console.error('Failed to sync on login:', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('igwt_user');
    localStorage.removeItem('igwt_userName');
    setUserName('');
    setCompletedChapters([]);
    localStorage.removeItem('igwt_completed_chapters');
  };

  const handleToggleChapterCompleted = async (book: string, chapter: number) => {
    const exists = completedChapters.some(c => c.book === book && c.chapter === chapter);
    let updated;
    if (exists) {
      updated = completedChapters.filter(c => !(c.book === book && c.chapter === chapter));
    } else {
      updated = [...completedChapters, { book, chapter }];
    }
    setCompletedChapters(updated);
    localStorage.setItem('igwt_completed_chapters', JSON.stringify(updated));

    if (user) {
      try {
        await fetch(getApiUrl('/api/progress/toggle'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            book,
            chapter,
            completed: !exists
          })
        });
      } catch (e) {
        console.error('Failed to sync completed chapter toggle:', e);
      }
    }
  };

  if (showSplash) {
    return (
      /* Splash screen */
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center z-50 p-6" id="splash-screen">
        <div className="space-y-6 max-w-sm flex flex-col items-center">
          <div className="relative">
            {/* Pulsing ring background */}
            <div className="absolute inset-0 rounded-3xl bg-gold-500/10 animate-ping duration-1000" />
            <img 
              src="https://i.ibb.co/NRBK22V/jawadmd.jpg" 
              alt="IGWT Bible Logo" 
              className="w-24 h-24 rounded-3xl border border-gold-500/20 shadow-2xl relative z-10 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2 animate-pulse">
            <h1 className="font-serif font-black text-4xl text-zinc-100 tracking-tight">IGWT Bible</h1>
            <p className="font-sans text-xs text-gold-400 tracking-widest font-semibold uppercase">"In God We Trust"</p>
          </div>
          <div className="pt-12 text-[10px] font-sans text-zinc-600 tracking-wider">
            In God We Trust • Daily Scriptures
          </div>
        </div>
      </div>
    );
  }

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col max-w-md mx-auto relative border-x transition-colors duration-250 ${
      isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-950 text-zinc-100'
    }`} id="igwt-bible-container">
      
      {/* Dynamic Content Pane based on active bottom-tab navigation */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'today' && (
          <TodayView
            onNavigateToBible={handleNavigateToBible}
            streak={streak}
            onBookmarkVerse={handleBookmarkToggleFromToday}
            bookmarks={bookmarks}
            recentHighlight={highlights.length > 0 ? highlights[0] : null}
            onOpenShareModal={handleOpenShareModal}
            readingGoal={settings.readingGoal}
            history={history}
            userName={userName}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            dailyVerse={dailyVerse}
          />
        )}

        {activeTab === 'bible' && (
          <BibleView
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVerseNum={currentVerseNum}
            onNavigateTo={handleNavigateToBible}
            onOpenBookSelector={() => setIsBookSelectorOpen(true)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            highlights={highlights}
            onAddHighlight={handleAddHighlight}
            onDeleteHighlight={handleDeleteHighlight}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onLogHistory={handleLogHistory}
            onOpenShareModal={handleOpenShareModal}
            onQuickNavigateTab={setActiveTab}
            cachedChapters={cachedChapters}
            onCacheChapter={handleCacheChapter}
            theme={theme}
            completedChapters={completedChapters}
            onToggleChapterCompleted={handleToggleChapterCompleted}
          />
        )}

        {activeTab === 'guides' && (
          <GuidesView
            onNavigateToBible={handleNavigateToBible}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            onNavigateToVerse={handleNavigateToBible}
            cachedChapters={cachedChapters}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            highlights={highlights}
            onDeleteHighlight={handleDeleteHighlight}
            onUpdateHighlightColor={handleUpdateHighlightColor}
            bookmarks={bookmarks}
            onDeleteBookmark={handleDeleteBookmark}
            notes={notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            history={history}
            onClearHistory={handleClearHistory}
            streak={streak}
            onNavigateToVerse={handleNavigateToBible}
            downloads={downloads}
            onUpdateDownloads={handleUpdateDownloads}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            completedChapters={completedChapters}
          />
        )}
      </main>

      {/* Bottom Navigation Control Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-30 max-w-md mx-auto backdrop-blur-md transition-colors duration-250 ${
        isLight ? 'bg-white/95 border-zinc-200 text-zinc-800' : 'bg-zinc-950/90 border-zinc-900/85 text-zinc-100'
      }`}>
        <div className="grid grid-cols-4 h-16">
          
          {/* TODAY Tab */}
          <button
            onClick={() => {
              setActiveTab('today');
              setCurrentVerseNum(undefined);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'today'
                ? (isLight ? 'text-zinc-950 font-black' : 'text-zinc-100')
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            {isLight ? (
              <Moon className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.5] text-zinc-950' : 'text-zinc-500'}`} />
            ) : (
              <Moon className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.5] text-zinc-100' : 'text-zinc-500'}`} />
            )}
            <span className="text-[10px] font-sans font-bold tracking-wide">Today</span>
          </button>

          {/* BIBLE Tab */}
          <button
            onClick={() => {
              setActiveTab('bible');
              setCurrentVerseNum(undefined);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'bible'
                ? (isLight ? 'text-zinc-950 font-black' : 'text-zinc-100')
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'bible' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-sans font-bold tracking-wide">Bible</span>
          </button>

          {/* GUIDES Tab */}
          <button
            onClick={() => {
              setActiveTab('guides');
              setCurrentVerseNum(undefined);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'guides'
                ? (isLight ? 'text-zinc-950 font-black' : 'text-zinc-100')
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <Map className={`w-5 h-5 ${activeTab === 'guides' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-sans font-bold tracking-wide">Guides</span>
          </button>

          {/* PROFILE / WORKSPACE Tab */}
          <button
            onClick={() => {
              setActiveTab('profile');
              setCurrentVerseNum(undefined);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
              activeTab === 'profile'
                ? (isLight ? 'text-zinc-950 font-black' : 'text-zinc-100')
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-sans font-bold tracking-wide">Profile</span>
            {streak.currentStreak > 0 && (
              <div className="absolute top-2.5 right-8 w-2 h-2 bg-[#e9ae34] rounded-full animate-pulse" />
            )}
          </button>

        </div>
      </nav>

      {/* Scripture Selection Drawer / Overlay */}
      {isBookSelectorOpen && (
        <BookSelectorView
          onSelectBookChapter={handleNavigateToBible}
          onClose={() => setIsBookSelectorOpen(false)}
          theme={theme}
        />
      )}

      {/* Share design graphic canvas overlay */}
      {isShareModalOpen && (
        <VerseCardModal
          verse={shareVerse}
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareVerse(null);
          }}
        />
      )}

      {/* Name Input Dialog Overlay for First-time Entry */}
      {!userName && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-xs w-full bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 space-y-6 shadow-2xl relative">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-[#e9ae34] animate-pulse" />
              </div>
              <h2 className="font-sans font-black text-xl text-zinc-100">Welcome</h2>
              <p className="font-sans text-xs text-zinc-500 leading-relaxed">
                Welcome to IGWT Bible. To personalize your daily scriptures and devotion logs, please enter your name.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value.trim();
              if (input) {
                localStorage.setItem('igwt_userName', input);
                setUserName(input);
              }
            }} className="space-y-4">
              <input
                type="text"
                name="username"
                required
                placeholder="Enter your name..."
                maxLength={30}
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-900 focus:border-[#e9ae34]/30 rounded-2xl text-sm text-zinc-150 placeholder-zinc-700 text-center focus:outline-none transition-all font-sans"
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-[#e9ae34] text-black font-extrabold text-xs tracking-wider uppercase rounded-2xl hover:bg-gold-400 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                Continue
              </button>
            </form>
            {userIp && (
              <div className="font-sans text-[9px] text-zinc-600 uppercase tracking-widest pt-2">
                Device IP tracked: {userIp}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
