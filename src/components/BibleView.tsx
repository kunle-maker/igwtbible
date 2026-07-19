import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Settings, BookOpen, Search, Bookmark, 
  Copy, Share2, Highlighter, FileText, Check, ListPlus, Sliders, EyeOff, Sparkles, Trash, Trash2, ChevronDown,
  Volume2, VolumeX
} from 'lucide-react';
import { Verse, Highlight, Bookmark as BookmarkType, Note, AppSettings } from '../types';
import { OFFLINE_FALLBACKS } from '../data/bibleBooks';

interface BibleViewProps {
  currentBook: string;
  currentChapter: number;
  currentVerseNum?: number;
  onNavigateTo: (book: string, chapter: number, verseNum?: number) => void;
  onOpenBookSelector: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  highlights: Highlight[];
  onAddHighlight: (book: string, chapter: number, verseNum: number, color: Highlight['color']) => void;
  onDeleteHighlight: (id: string) => void;
  bookmarks: BookmarkType[];
  onAddBookmark: (book: string, chapter: number, verseNum: number) => void;
  onDeleteBookmark: (id: string) => void;
  notes: Note[];
  onAddNote: (book: string, chapter: number, verseNum: number, text: string) => void;
  onDeleteNote: (id: string) => void;
  onLogHistory: (book: string, chapter: number, translation: string) => void;
  onOpenShareModal: (verse: { text: string; book: string; chapter: number; verseNum: number; translation: string }) => void;
  onQuickNavigateTab: (tabId: 'today' | 'bible' | 'search' | 'guides' | 'profile') => void;
  cachedChapters: { [key: string]: { book: string; chapter: number; translation: string; verses: Verse[] } };
  onCacheChapter: (key: string, data: { book: string; chapter: number; translation: string; verses: Verse[] }) => void;
  theme?: 'light' | 'dark';
  completedChapters?: { book: string; chapter: number }[];
  onToggleChapterCompleted?: (book: string, chapter: number) => void;
}

export default function BibleView({
  currentBook,
  currentChapter,
  currentVerseNum,
  onNavigateTo,
  onOpenBookSelector,
  settings,
  onUpdateSettings,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  notes,
  onAddNote,
  onDeleteNote,
  onLogHistory,
  onOpenShareModal,
  onQuickNavigateTab,
  cachedChapters,
  onCacheChapter,
  theme = 'dark',
  completedChapters = [],
  onToggleChapterCompleted = () => {}
}: BibleViewProps) {
  const isLight = theme === 'light';
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTranslation, setActiveTranslation] = useState(settings.defaultTranslation);
  
  // Reading mode configurations
  const [focusMode, setFocusMode] = useState(false); // hides headers for pure reading
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  
  // Verse selection states
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [highlightColorMenu, setHighlightColorMenu] = useState(false);
  const [noteInputText, setNoteInputText] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when book, chapter, or translation changes
  useEffect(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentBook, currentChapter, activeTranslation]);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!verses || verses.length === 0) return;
      
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const utterances: SpeechSynthesisUtterance[] = [];
      
      verses.forEach((v) => {
        const cleanText = v.text
          .replace(/<[^>]*>/g, '') // strip HTML if any
          .replace(/\[.*?\]/g, '') // remove bracketed notes if any
          .trim();
        
        if (cleanText) {
          const utterance = new SpeechSynthesisUtterance(`Verse ${v.number}. ${cleanText}`);
          utterances.push(utterance);
        }
      });
      
      if (utterances.length === 0) return;
      
      // Attach end and error handlers to the last utterance
      const lastUtterance = utterances[utterances.length - 1];
      lastUtterance.onend = () => {
        setIsSpeaking(false);
      };
      lastUtterance.onerror = (event) => {
        if (event.error !== 'interrupted') {
          setIsSpeaking(false);
        }
      };
      
      // Speak all of them (the browser queues them up automatically)
      utterances.forEach((u) => {
        window.speechSynthesis.speak(u);
      });
      
      setIsSpeaking(true);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  // 1. Load Scripture passages (coordinates with server proxy, fallbacks & local cache)
  useEffect(() => {
    let active = true;
    const fetchPassage = async () => {
      setLoading(true);
      setError(null);
      setSelectedVerses([]);
      setShowActionSheet(false);

      const cacheKey = `${currentBook}_${currentChapter}_${activeTranslation}`.toLowerCase();

      // Check if this chapter exists in our cached chapters memory
      if (cachedChapters[cacheKey]) {
        if (active) {
          setVerses(cachedChapters[cacheKey].verses);
          setLoading(false);
          // Log history
          onLogHistory(currentBook, currentChapter, activeTranslation);
        }
        return;
      }

      // Check offline fallbacks if match KJV
      if (activeTranslation === 'KJV') {
        const offlineMatch = OFFLINE_FALLBACKS.find(
          (fallback) => fallback.book.toLowerCase() === currentBook.toLowerCase() && fallback.chapter === currentChapter
        );
        if (offlineMatch) {
          if (active) {
            setVerses(offlineMatch.verses);
            setLoading(false);
            onLogHistory(currentBook, currentChapter, activeTranslation);
          }
          return;
        }
      }

      // Attempt to load from Bible Gateway scrapers via server route
      try {
        const response = await fetch(
          `/api/passage?book=${encodeURIComponent(currentBook)}&chapter=${currentChapter}&version=${encodeURIComponent(activeTranslation)}`
        );

        if (!response.ok) {
          throw new Error('Scripture server returned error.');
        }

        const data = await response.json();
        if (active) {
          setVerses(data.verses);
          // Cache successful response locally
          onCacheChapter(cacheKey, {
            book: currentBook,
            chapter: currentChapter,
            translation: activeTranslation,
            verses: data.verses
          });
          onLogHistory(currentBook, currentChapter, activeTranslation);
        }
      } catch (err: any) {
        console.error('Fetch error, using ultimate offline fallback generator', err);
        if (active) {
          // If completely offline and no match found, check if ANY fallback matching book exists
          const bookFallback = OFFLINE_FALLBACKS.find(
            (fallback) => fallback.book.toLowerCase() === currentBook.toLowerCase()
          );
          if (bookFallback) {
            setVerses(bookFallback.verses);
            setError(`Offline fallback loaded. (Genesis/John/Psalms available completely offline)`);
          } else {
            // Ultimate fallback generation to ensure the app never displays blank screens
            const mockVerses = [
              { number: 1, text: `The chapter content for ${currentBook} ${currentChapter} requires an active network connection or previously saved cached download.` },
              { number: 2, text: `Go to Profile > Downloads tab to verify downloaded scripture translations.` },
              { number: 3, text: `Faith is the substance of things hoped for, the evidence of things not seen.` }
            ];
            setVerses(mockVerses);
            setError(`Offline: ${currentBook} ${currentChapter} is not cached. Connect to internet or choose a cached book (Genesis 1, John 3, Psalms 23).`);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPassage();

    return () => {
      active = false;
    };
  }, [currentBook, currentChapter, activeTranslation]);

  // 2. Scroll to targeted verse number
  useEffect(() => {
    if (!loading && currentVerseNum && verseRefs.current[currentVerseNum]) {
      setTimeout(() => {
        verseRefs.current[currentVerseNum]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pulse highlight effect
        setSelectedVerses([currentVerseNum]);
        setShowActionSheet(true);
      }, 500);
    }
  }, [loading, currentVerseNum]);

  // Helper to get matching highlights
  const getHighlightColor = (verseNum: number) => {
    const found = highlights.find(
      (h) => h.book === currentBook && h.chapter === currentChapter && h.verseNum === verseNum
    );
    return found ? found.color : null;
  };

  // Helper to check bookmark
  const isBookmarked = (verseNum: number) => {
    return bookmarks.some(
      (b) => b.book === currentBook && b.chapter === currentChapter && b.verseNum === verseNum
    );
  };

  // Handle verse tap
  const handleVerseClick = (verseNum: number) => {
    if (selectedVerses.includes(verseNum)) {
      const updated = selectedVerses.filter((v) => v !== verseNum);
      setSelectedVerses(updated);
      if (updated.length === 0) {
        setShowActionSheet(false);
      }
    } else {
      const updated = [...selectedVerses, verseNum].sort((a, b) => a - b);
      setSelectedVerses(updated);
      setShowActionSheet(true);
    }
    // Close colors and note forms
    setHighlightColorMenu(false);
    setShowNoteForm(false);
  };

  // Previous & Next Chapter Paginators
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      onNavigateTo(currentBook, currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    // Basic chapters boundary, fallback to 1st of same or next book
    onNavigateTo(currentBook, currentChapter + 1);
  };

  // Verse actions execution
  const handleApplyHighlight = (color: Highlight['color']) => {
    selectedVerses.forEach((v) => {
      onAddHighlight(currentBook, currentChapter, v, color);
    });
    setHighlightColorMenu(false);
    setSelectedVerses([]);
    setShowActionSheet(false);
  };

  const handleRemoveHighlight = () => {
    selectedVerses.forEach((v) => {
      const found = highlights.find(
        (h) => h.book === currentBook && h.chapter === currentChapter && h.verseNum === v
      );
      if (found) onDeleteHighlight(found.id);
    });
    setSelectedVerses([]);
    setShowActionSheet(false);
  };

  const handleToggleBookmark = () => {
    selectedVerses.forEach((v) => {
      const found = bookmarks.find(
        (b) => b.book === currentBook && b.chapter === currentChapter && b.verseNum === v
      );
      if (found) {
        onDeleteBookmark(found.id);
      } else {
        onAddBookmark(currentBook, currentChapter, v);
      }
    });
    setSelectedVerses([]);
    setShowActionSheet(false);
  };

  const handleCopySelected = () => {
    const textLines = selectedVerses.map((v) => {
      const text = verses.find((vs) => vs.number === v)?.text || '';
      return `[${v}] ${text}`;
    });
    const fullText = `"${textLines.join(' ')}"\n\n— ${currentBook} ${currentChapter}:${selectedVerses.join(',')} (${activeTranslation})\nShared via IGWT Bible`;
    
    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
      setSelectedVerses([]);
      setShowActionSheet(false);
    }, 1500);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInputText.trim()) return;

    selectedVerses.forEach((v) => {
      onAddNote(currentBook, currentChapter, v, noteInputText);
    });

    setNoteInputText('');
    setShowNoteForm(false);
    setSelectedVerses([]);
    setShowActionSheet(false);
  };

  const handleShareSelected = () => {
    if (selectedVerses.length === 1) {
      const vNum = selectedVerses[0];
      const vText = verses.find((vs) => vs.number === vNum)?.text || '';
      onOpenShareModal({
        text: vText,
        book: currentBook,
        chapter: currentChapter,
        verseNum: vNum,
        translation: activeTranslation
      });
    } else {
      // Join multiple
      const textLines = selectedVerses.map((v) => {
        const text = verses.find((vs) => vs.number === v)?.text || '';
        return `[${v}] ${text}`;
      });
      onOpenShareModal({
        text: textLines.join(' '),
        book: currentBook,
        chapter: currentChapter,
        verseNum: selectedVerses[0], // Represented by first verse
        translation: activeTranslation
      });
    }
    setSelectedVerses([]);
    setShowActionSheet(false);
  };

  // Group of note references
  const getVerseNote = (verseNum: number) => {
    return notes.find(
      (n) => n.book === currentBook && n.chapter === currentChapter && n.verseNum === verseNum
    );
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-250 ${
      isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-black text-zinc-100'
    }`} id="bible-reader-view">
      
      {/* Top Selector Control Bar */}
      {!focusMode && (
        <div className={`px-4 py-3 border-b sticky top-0 z-30 flex items-center justify-between backdrop-blur-md transition-colors duration-250 ${
          isLight ? 'bg-white/95 border-zinc-200' : 'bg-black/90 border-zinc-900'
        }`}>
          {/* Search Trigger (Left) */}
          <button
            onClick={() => onQuickNavigateTab('search')}
            className={`p-2 rounded-full transition-colors cursor-pointer animate-fade-in ${
              isLight ? 'hover:bg-zinc-150 text-zinc-650 hover:text-zinc-950' : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100'
            }`}
            title="Search scripture"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Book Selector Trigger (Center) */}
          <button
            onClick={onOpenBookSelector}
            className={`flex items-center gap-1 px-4 py-1.5 rounded-full active:scale-95 transition-all text-sm font-sans font-extrabold tracking-tight cursor-pointer ${
              isLight ? 'hover:bg-zinc-150 text-zinc-800 hover:text-black' : 'hover:bg-zinc-950 text-zinc-100 hover:text-white'
            }`}
          >
            <span>{currentBook} {currentChapter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {/* Widgets (Right) */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeTranslation}
              onChange={(e) => setActiveTranslation(e.target.value)}
              className={`border rounded-full px-2.5 py-1 text-[10px] font-sans font-extrabold focus:outline-none transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-white border-zinc-250 text-zinc-700 focus:border-zinc-400' 
                  : 'bg-[#121212] border-zinc-900 text-zinc-300 focus:border-zinc-850'
              }`}
            >
              {['KJV', 'NKJV', 'NIV', 'ESV', 'NLT', 'NASB', 'CSB'].map((tr) => (
                <option key={tr} value={tr}>{tr}</option>
              ))}
            </select>

            {/* Read Aloud TTS toggle */}
            <button
              onClick={handleToggleSpeak}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isSpeaking 
                  ? 'bg-[#e9ae34]/15 text-[#e9ae34]' 
                  : (isLight ? 'text-zinc-550 hover:text-zinc-950 hover:bg-zinc-150/50' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900')
              }`}
              title={isSpeaking ? 'Stop Read Aloud' : 'Read Aloud'}
            >
              {isSpeaking ? <VolumeX className="w-4.5 h-4.5 text-[#e9ae34]" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>

            {/* Quick config toggle */}
            <button
              onClick={() => setShowQuickSettings(!showQuickSettings)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                showQuickSettings 
                  ? (isLight ? 'bg-zinc-200 text-zinc-950' : 'bg-zinc-900 text-white') 
                  : (isLight ? 'text-zinc-550 hover:text-zinc-950 hover:bg-zinc-150/50' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900')
              }`}
              title="Quick Layout Adjuster"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Layout Customizer Panel */}
      {showQuickSettings && (
        <div className={`absolute top-14 left-4 right-4 z-40 p-5 rounded-3xl border shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-250 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-850' : 'bg-zinc-950 border-zinc-900 text-zinc-100'
        }`}>
          <div className={`flex justify-between items-center pb-2 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-900'}`}>
            <span className="font-mono text-[9px] uppercase tracking-widest text-gold-500 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Customizer
            </span>
            <button 
              onClick={() => setShowQuickSettings(false)}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Done
            </button>
          </div>

          {/* Font size */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>Font Size</span>
              <span className={`font-mono font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateSettings({ ...settings, fontSize: Math.max(14, settings.fontSize - 1) })}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm ${
                  isLight ? 'bg-zinc-100 border-zinc-250 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-850 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                A-
              </button>
              <input
                type="range"
                min="14"
                max="30"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                className="flex-1 accent-gold-500"
              />
              <button
                onClick={() => onUpdateSettings({ ...settings, fontSize: Math.min(30, settings.fontSize + 1) })}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm ${
                  isLight ? 'bg-zinc-100 border-zinc-250 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-850 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                A+
              </button>
            </div>
          </div>

          {/* Line spacing */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>Line Spacing</span>
              <span className={`font-mono font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{settings.lineSpacing}x</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.2"
              value={settings.lineSpacing}
              onChange={(e) => onUpdateSettings({ ...settings, lineSpacing: parseFloat(e.target.value) })}
              className="w-full accent-gold-500"
            />
          </div>

          {/* Reading Focus Toggle */}
          <button
            onClick={() => {
              setFocusMode(!focusMode);
              setShowQuickSettings(false);
            }}
            className={`w-full py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isLight ? 'bg-zinc-100 border-zinc-250 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <EyeOff className="w-4 h-4 text-zinc-500" />
            <span>{focusMode ? 'Show Control Bars' : 'Toggle Distraction-free Focus'}</span>
          </button>
        </div>
      )}

      {/* Scripture Content Reader Pane */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
        id="scripture-reader-pane"
      >
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-4 max-w-sm mx-auto pt-16 animate-pulse">
            <div className={`h-6 w-3/4 rounded mx-auto ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
            <div className={`h-4 w-5/6 rounded mx-auto ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
            <div className={`h-4 w-full rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
            <div className={`h-4 w-full rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
            <div className={`h-4 w-2/3 rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
            <div className={`h-4 w-full rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
          </div>
        ) : (
          <div className="space-y-8 max-w-lg mx-auto pb-24">
            
            {/* Elegant Chapter Title */}
            <div className="text-center space-y-2">
              <h1 className={`font-serif font-extrabold text-3xl md:text-4xl tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                {currentBook} {currentChapter}
              </h1>
              <span className="font-sans text-[10px] text-gold-500/80 font-bold tracking-widest uppercase block">
                {activeTranslation} • Offline-First Lesson
              </span>
              {error && (
                <div className="max-w-xs mx-auto p-2 bg-rose-950/10 border border-rose-950/20 rounded-xl text-[10px] text-zinc-500">
                  {error}
                </div>
              )}
            </div>

            {/* Reading Scriptures */}
            <div 
              className={`font-sans leading-relaxed space-y-3 ${isLight ? 'text-zinc-850' : 'text-zinc-200'}`}
              style={{ 
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineSpacing
              }}
            >
              {verses.map((v) => {
                const hlColor = getHighlightColor(v.number);
                const hasBmk = isBookmarked(v.number);
                const isSel = selectedVerses.includes(v.number);
                const note = getVerseNote(v.number);

                return (
                  <div 
                    key={v.number}
                    ref={(el) => { verseRefs.current[v.number] = el; }}
                    onClick={() => handleVerseClick(v.number)}
                    className={`block w-full cursor-pointer select-none rounded-[16px] px-4 py-3 transition-all duration-200 border border-transparent ${
                      isSel 
                        ? (isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-950 shadow-sm' : 'bg-zinc-800 border-zinc-700 text-zinc-50 shadow-sm') 
                        : (isLight ? 'hover:bg-zinc-100/70 text-zinc-850' : 'hover:bg-[#121212] text-zinc-200')
                    }`}
                    style={{
                      backgroundColor: hlColor && !isSel ? (
                        hlColor === 'yellow' ? 'rgba(245, 158, 11, 0.15)' : 
                        hlColor === 'blue' ? 'rgba(59, 130, 246, 0.15)' : 
                        hlColor === 'green' ? 'rgba(16, 185, 129, 0.15)' : 
                        hlColor === 'pink' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(249, 115, 22, 0.15)'
                      ) : undefined,
                      borderLeft: hlColor && !isSel ? `4px solid ${
                        hlColor === 'yellow' ? '#f59e0b' : 
                        hlColor === 'blue' ? '#3b82f6' : 
                        hlColor === 'green' ? '#10b981' : 
                        hlColor === 'pink' ? '#ec4899' : '#f97316'
                      }` : undefined
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Verse Number superscript */}
                      <span className={`font-sans text-[11px] font-black select-none mt-1 min-w-[20px] text-center ${
                        isSel ? 'text-zinc-900' : hasBmk ? 'text-[#e9ae34] font-extrabold' : 'text-zinc-500'
                      }`}>
                        {v.number}
                      </span>
                      
                      {/* Verse text body */}
                      <span className="flex-1 font-sans font-medium tracking-tight leading-relaxed">{v.text}</span>
                      
                      {/* Inline indicators for note presence */}
                      {note && (
                        <span className="inline-flex ml-1 text-[10px] text-blue-400 select-none align-middle" title="Review note">
                          <FileText className="w-3.5 h-3.5 inline fill-blue-500/10" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Elegant Completed Chapter Progress Card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              isLight 
                ? 'bg-zinc-100/60 border-zinc-200' 
                : 'bg-zinc-950/40 border-zinc-900/60'
            }`}>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono font-bold text-gold-500 tracking-wider">Lesson Progress</span>
                <p className="text-xs font-bold font-sans">Finished reading this chapter?</p>
              </div>
              <button
                onClick={() => onToggleChapterCompleted(currentBook, currentChapter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  completedChapters?.some((c: any) => c.book === currentBook && c.chapter === currentChapter)
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/20'
                }`}
              >
                <span>{completedChapters?.some((c: any) => c.book === currentBook && c.chapter === currentChapter) ? '✓ Completed' : 'Mark Complete'}</span>
              </button>
            </div>

            {/* Bottom pagination & Zen Mode exit triggers */}
            <div className={`flex justify-between items-center pt-8 border-t ${
              isLight ? 'border-zinc-200' : 'border-zinc-900'
            }`}>
              <button
                onClick={handlePrevChapter}
                disabled={currentChapter === 1}
                className={`flex items-center gap-1 px-4 py-3 border disabled:opacity-20 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white border-zinc-250 text-zinc-700 hover:text-black hover:border-zinc-350 shadow-xs' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-300 hover:text-zinc-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {focusMode && (
                <button
                  onClick={() => setFocusMode(false)}
                  className={`px-3.5 py-2.5 rounded-full border text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-white border-zinc-250 text-zinc-600 hover:text-zinc-900' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Exit Focus Mode
                </button>
              )}

              <button
                onClick={handleNextChapter}
                className={`flex items-center gap-1 px-4 py-3 border rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white border-zinc-250 text-zinc-700 hover:text-black hover:border-zinc-350 shadow-xs' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-300 hover:text-zinc-100'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Floating Action Bar / Verse Action Sheet (When verses are selected) */}
      {showActionSheet && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-4 bg-transparent animate-in slide-in-from-bottom-6 duration-300">
          <div className="max-w-md mx-auto bg-zinc-950 border border-zinc-850 rounded-3xl shadow-2xl p-4 space-y-4">
            
            {/* Status indicator */}
            <div className="flex justify-between items-center text-xs font-semibold px-1">
              <span className="text-zinc-400">Selected {selectedVerses.length} {selectedVerses.length === 1 ? 'verse' : 'verses'}</span>
              <button 
                onClick={() => {
                  setSelectedVerses([]);
                  setShowActionSheet(false);
                }}
                className="text-zinc-500 hover:text-zinc-300 text-[10px] uppercase tracking-wider font-bold"
              >
                Clear selection
              </button>
            </div>

            {/* Main actions bar */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              {/* Highlight Trigger */}
              <button
                onClick={() => setHighlightColorMenu(!highlightColorMenu)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all gap-1 cursor-pointer ${
                  highlightColorMenu ? 'bg-gold-500/10 text-gold-400' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Highlighter className="w-5 h-5" />
                <span className="text-[10px] font-medium font-sans">Highlight</span>
              </button>

              {/* Bookmark toggle */}
              <button
                onClick={handleToggleBookmark}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all gap-1 cursor-pointer"
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-[10px] font-medium font-sans">Save</span>
              </button>

              {/* Note toggle */}
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all gap-1 cursor-pointer ${
                  showNoteForm ? 'bg-gold-500/10 text-gold-400' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-medium font-sans">Note</span>
              </button>

              {/* Copy selection */}
              <button
                onClick={handleCopySelected}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all gap-1 cursor-pointer"
              >
                {copySuccess ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                <span className="text-[10px] font-medium font-sans">{copySuccess ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Design Share card */}
              <button
                onClick={handleShareSelected}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border border-gold-500/20 transition-all gap-1 cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-[10px] font-medium font-sans">Design</span>
              </button>
            </div>

            {/* HIGHLIGHT COLOR SUBMENU */}
            {highlightColorMenu && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-900 flex justify-between items-center gap-2 animate-in fade-in duration-200">
                <span className="font-sans text-[10px] font-semibold text-zinc-500 uppercase tracking-widest pl-1">Tag color:</span>
                <div className="flex items-center gap-3">
                  {/* Color dots */}
                  {(['yellow', 'blue', 'green', 'pink', 'orange'] as Highlight['color'][]).map((col) => (
                    <button
                      key={col}
                      onClick={() => handleApplyHighlight(col)}
                      className="w-6 h-6 rounded-full border border-black/30 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                      style={{
                        backgroundColor: 
                          col === 'yellow' ? '#f59e0b' : 
                          col === 'blue' ? '#3b82f6' : 
                          col === 'green' ? '#10b981' : 
                          col === 'pink' ? '#ec4899' : '#f97316'
                      }}
                    />
                  ))}
                  
                  {/* Trash remover */}
                  <button
                    onClick={handleRemoveHighlight}
                    className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-950 rounded-lg transition-colors ml-2"
                    title="Remove colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* WRITING NOTES SUBMENU */}
            {showNoteForm && (
              <form onSubmit={handleSaveNote} className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Write Devotional Notes</span>
                  <button 
                    type="button" 
                    onClick={() => setShowNoteForm(false)}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Reflections, prayers, lessons..."
                    value={noteInputText}
                    onChange={(e) => setNoteInputText(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-850 focus:border-gold-500/30 text-xs rounded-xl text-zinc-200 focus:outline-none placeholder-zinc-600"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-gold-500 text-black text-xs font-bold rounded-xl active:scale-95 transition-transform"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
