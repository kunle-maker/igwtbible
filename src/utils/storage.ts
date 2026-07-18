import { Highlight, Bookmark, Note, ReadingHistoryItem, StreakState, AppSettings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'igwt_settings',
  HIGHLIGHTS: 'igwt_highlights',
  BOOKMARKS: 'igwt_bookmarks',
  NOTES: 'igwt_notes',
  HISTORY: 'igwt_history',
  STREAK: 'igwt_streak',
  DOWNLOADS: 'igwt_downloads',
  LAST_READ: 'igwt_last_read',
};

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 14,
  lineSpacing: 1.6,
  defaultTranslation: 'KJV',
  notifications: {
    dailyVerse: true,
    dailyPrayer: true,
    readingReminder: true,
  },
  reminderTimes: {
    dailyVerse: '08:00',
    dailyPrayer: '12:00',
    readingReminder: '20:00',
  },
  readingGoal: 1,
};

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  daysRead: [],
};

const DEFAULT_LAST_READ = {
  book: 'John',
  chapter: 3,
  verseNum: 16,
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const loadHighlights = (): Highlight[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load highlights', e);
    return [];
  }
};

export const saveHighlights = (highlights: Highlight[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
  } catch (e) {
    console.error('Failed to save highlights', e);
  }
};

export const loadBookmarks = (): Bookmark[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load bookmarks', e);
    return [];
  }
};

export const saveBookmarks = (bookmarks: Bookmark[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
};

export const loadNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load notes', e);
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
};

export const loadHistory = (): ReadingHistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
};

export const saveHistory = (history: ReadingHistoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const loadStreak = (): StreakState => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STREAK);
    return data ? JSON.parse(data) : DEFAULT_STREAK;
  } catch (e) {
    console.error('Failed to load streak', e);
    return DEFAULT_STREAK;
  }
};

export const saveStreak = (streak: StreakState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (e) {
    console.error('Failed to save streak', e);
  }
};

export const loadDownloads = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    // KJV and NKJV are standard preloaded or default
    return data ? JSON.parse(data) : ['KJV', 'NKJV'];
  } catch (e) {
    console.error('Failed to load downloads', e);
    return ['KJV', 'NKJV'];
  }
};

export const saveDownloads = (downloads: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
  } catch (e) {
    console.error('Failed to save downloads', e);
  }
};

export const loadLastRead = (): { book: string; chapter: number; verseNum: number } => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return data ? JSON.parse(data) : DEFAULT_LAST_READ;
  } catch (e) {
    console.error('Failed to load last read', e);
    return DEFAULT_LAST_READ;
  }
};

export const saveLastRead = (book: string, chapter: number, verseNum: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify({ book, chapter, verseNum }));
  } catch (e) {
    console.error('Failed to save last read', e);
  }
};

// Clean helpers to calculate and update Reading Streaks offline
export const checkAndUpdateStreak = (streak: StreakState): StreakState => {
  const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // If already logged reading today, do nothing
  if (streak.daysRead.includes(todayStr)) {
    return streak;
  }

  const updatedDaysRead = [...streak.daysRead, todayStr].sort();
  
  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();
  
  while (true) {
    const checkDateStr = checkDate.toISOString().split('T')[0];
    if (updatedDaysRead.includes(checkDateStr)) {
      currentStreak++;
      // Subtract 24 hours to go to previous day
      checkDate.setTime(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      // If it's not today, check if yesterday was read. If yes, the streak is alive.
      // If we are looking at checkDate as "yesterday" (the first iteration offset is "today"),
      // let's verify if the user missed reading yesterday.
      const isCheckingToday = checkDateStr === todayStr;
      if (isCheckingToday) {
        // user hasn't read today yet, let's check yesterday
        checkDate.setTime(checkDate.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        if (updatedDaysRead.includes(yesterdayStr)) {
          // Streak is still alive through yesterday
          continue;
        }
      }
      break;
    }
  }

  const longestStreak = Math.max(streak.longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastReadDate: todayStr,
    daysRead: updatedDaysRead,
  };
};
