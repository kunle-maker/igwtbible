import { useState, useEffect } from 'react';
import { Moon, Sun, Share2, FileText, Zap, Sparkles } from 'lucide-react';
import { StreakState, ReadingHistoryItem } from '../types';

interface TodayViewProps {
  onNavigateToBible: (book: string, chapter: number, verseNum?: number) => void;
  streak: StreakState;
  onBookmarkVerse: (book: string, chapter: number, verseNum: number) => void;
  bookmarks: any[];
  recentHighlight: any | null;
  onOpenShareModal: (verse: { text: string; book: string; chapter: number; verseNum: number; translation: string }) => void;
  readingGoal: number;
  history: ReadingHistoryItem[];
  userName?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  dailyVerse?: {
    reference: string;
    book: string;
    chapter: number;
    verseNum: number;
    text: string;
    translation: string;
  } | null;
}

export default function TodayView({
  onNavigateToBible,
  streak,
  onOpenShareModal,
  history,
  userName = 'Brother',
  theme = 'dark',
  onToggleTheme,
  dailyVerse
}: TodayViewProps) {
  const [greeting, setGreeting] = useState('Good Evening');
  const isLight = theme === 'light';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const latestReadBook = history.length > 0 ? history[0].book : 'Joshua';
  const latestReadChapter = history.length > 0 ? history[0].chapter : 4;

  return (
    <div className={`transition-colors duration-250 min-h-screen px-6 pt-8 pb-24 space-y-8 max-w-md mx-auto ${
      isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-black text-zinc-100'
    }`} id="today-view">
      
      {/* Header section with streak count and Title */}
      <div className="flex items-center justify-between">
        {/* Streak Indicator (Left) */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
          isLight 
            ? 'bg-zinc-100/80 border-zinc-200/60 text-zinc-800' 
            : 'bg-zinc-900/60 border-zinc-850/40 text-zinc-100'
        }`}>
          <Zap className="w-4 h-4 text-[#e9ae34] fill-[#e9ae34]" />
          <span className="font-sans font-extrabold text-sm">{streak.currentStreak || 1} day</span>
        </div>

        {/* Title Centered */}
        <h1 className="font-sans font-black text-2xl tracking-tight">
          Today
        </h1>

        {/* Theme Toggle Button (Right) */}
        <button
          onClick={onToggleTheme}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 border ${
            isLight 
              ? 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-800 shadow-sm' 
              : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-200'
          }`}
          aria-label="Toggle Theme"
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-zinc-700" />
          ) : (
            <Sun className="w-4 h-4 text-[#e9ae34] fill-[#e9ae34]/10" />
          )}
        </button>
      </div>

      {/* Greeting Banner */}
      <div className="flex items-center gap-2.5 pt-1">
        {isLight ? (
          <Sun className="w-5.5 h-5.5 text-zinc-800" />
        ) : (
          <Moon className="w-5.5 h-5.5 text-zinc-400" />
        )}
        <h2 className="font-sans font-bold text-lg tracking-tight">
          {greeting}, {userName}
        </h2>
      </div>

      {/* Verse of the Day Passage */}
      <div className={`p-5 rounded-[16px] border ${
        isLight 
          ? 'bg-white border-zinc-200 shadow-xs' 
          : 'bg-[#121212]/30 border-zinc-900/80'
      }`}>
        {/* Gold reference citation */}
        <div className="text-[#e9ae34] font-bold text-[11px] uppercase tracking-wider mb-2 font-mono">
          {dailyVerse ? `${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verseNum}` : "Philippians 4:7"}
        </div>

        {/* Main verse text */}
        <p className="font-serif text-base font-medium leading-relaxed tracking-normal text-zinc-150">
          "{dailyVerse ? dailyVerse.text : "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."}"
        </p>

        {/* Action Triggers Centered below text */}
        <div className="flex justify-center gap-12 pt-4 pb-1">
          {/* Share Action */}
          <button
            onClick={() => onOpenShareModal({
              text: dailyVerse ? dailyVerse.text : "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
              book: dailyVerse ? dailyVerse.book : "Philippians",
              chapter: dailyVerse ? dailyVerse.chapter : 4,
              verseNum: dailyVerse ? dailyVerse.verseNum : 7,
              translation: dailyVerse ? dailyVerse.translation : "NIV"
            })}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-zinc-500 group-hover:text-[#e9ae34] transition-colors" />
            <span className="text-[10px] font-sans font-bold tracking-tight text-zinc-500 group-hover:text-[#e9ae34] transition-colors">Share</span>
          </button>

          {/* Note Action */}
          <button
            onClick={() => onNavigateToBible(
              dailyVerse ? dailyVerse.book : 'Philippians', 
              dailyVerse ? dailyVerse.chapter : 4, 
              dailyVerse ? dailyVerse.verseNum : 7
            )}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <FileText className="w-4 h-4 text-zinc-500 group-hover:text-[#e9ae34] transition-colors" />
            <span className="text-[10px] font-sans font-bold tracking-tight text-zinc-500 group-hover:text-[#e9ae34] transition-colors">Read Full</span>
          </button>
        </div>
      </div>

      {/* Vertical Bento List Feed */}
      <div className="space-y-4 pt-2">
        
        {/* Card 1: Today's Prayer */}
        <div 
          onClick={() => onNavigateToBible(
            dailyVerse ? dailyVerse.book : 'Philippians', 
            dailyVerse ? dailyVerse.chapter : 4, 
            dailyVerse ? dailyVerse.verseNum : 7
          )}
          className={`flex items-center gap-4 p-4 rounded-[16px] border transition-all cursor-pointer ${
            isLight 
              ? 'bg-white hover:bg-zinc-100/50 border-zinc-200 shadow-sm' 
              : 'bg-[#121212] hover:bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800'
          }`}
        >
          {/* Duotone Thumbnail overlay */}
          <div className="w-20 h-14 rounded-[16px] bg-[#e6c170] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=150&q=80" 
              alt="Today's Prayer Thumbnail"
              className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-90 contrast-125"
              referrerPolicy="no-referrer"
            />
            {/* Open Book tiny overlay */}
            <div className="absolute bottom-1.5 left-2 bg-white/95 text-[#e6c170] rounded-md px-1 py-0.5 scale-90 shadow-sm border border-black/5">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-sans font-bold text-sm">Today's Prayer</h3>
            <p className={`font-sans text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>A Prayer of Thanks for God's Peace</p>
          </div>
        </div>

        {/* Card 2: Memorize Verse */}
        <div 
          onClick={() => onNavigateToBible(
            dailyVerse ? dailyVerse.book : 'Philippians', 
            dailyVerse ? dailyVerse.chapter : 4, 
            dailyVerse ? dailyVerse.verseNum : 7
          )}
          className={`flex items-center gap-4 p-4 rounded-[16px] border transition-all cursor-pointer ${
            isLight 
              ? 'bg-white hover:bg-zinc-100/50 border-zinc-200 shadow-sm' 
              : 'bg-[#121212] hover:bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800'
          }`}
        >
          {/* Duotone Thumbnail overlay */}
          <div className="w-20 h-14 rounded-[12px] bg-[#d29b95] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80" 
              alt="Memorize Verse Thumbnail"
              className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-90 contrast-125"
              referrerPolicy="no-referrer"
            />
            {/* Gold Cross overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-5 bg-[#d29b95] relative rounded-sm shadow-sm scale-90 border border-black/5">
                <div className="absolute top-1.5 left-[-3px] right-[-3px] h-1 bg-[#d29b95]" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-sans font-bold text-sm">Memorize Verse</h3>
            <p className={`font-sans text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {dailyVerse ? `${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verseNum}` : "Philippians 4:7"}
            </p>
          </div>
        </div>

        {/* Card 3: Continue Reading */}
        <div 
          onClick={() => onNavigateToBible(latestReadBook, latestReadChapter)}
          className={`flex items-center gap-4 p-4 rounded-[16px] border transition-all cursor-pointer ${
            isLight 
              ? 'bg-white hover:bg-zinc-100/50 border-zinc-200 shadow-sm' 
              : 'bg-[#121212] hover:bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800'
          }`}
        >
          {/* Duotone Thumbnail overlay */}
          <div className="w-20 h-14 rounded-[16px] bg-[#7cb9be] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" 
              alt="Continue Reading Thumbnail"
              className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-90 contrast-125"
              referrerPolicy="no-referrer"
            />
            {/* Torn paper graphic text overlay */}
            <div className="absolute bottom-1 right-1 bg-white/95 text-zinc-800 text-[8px] font-sans font-bold px-1 rounded shadow-sm border border-black/5 rotate-[-2deg]">
              {latestReadBook}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-sans font-bold text-sm">Continue Reading</h3>
            <p className={`font-sans text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{latestReadBook} {latestReadChapter}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
