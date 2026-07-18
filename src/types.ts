export interface Verse {
  number: number;
  text: string;
}

export interface Highlight {
  id: string;
  book: string;
  chapter: number;
  verseNum: number;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'orange';
  createdAt: string;
}

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verseNum: number;
  createdAt: string;
}

export interface Note {
  id: string;
  book: string;
  chapter: number;
  verseNum: number;
  verseRef: string;
  text: string;
  createdAt: string;
}

export interface ReadingHistoryItem {
  id: string;
  book: string;
  chapter: number;
  translation: string;
  timestamp: string;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null; // YYYY-MM-DD
  daysRead: string[]; // List of YYYY-MM-DD strings
}

export interface AppSettings {
  fontSize: number; // in pixels (e.g., 18, 20, 22, 24)
  lineSpacing: number; // line-height multiplier (e.g., 1.4, 1.6, 1.8, 2.0)
  defaultTranslation: string;
  notifications: {
    dailyVerse: boolean;
    dailyPrayer: boolean;
    readingReminder: boolean;
  };
  reminderTimes: {
    dailyVerse: string; // "08:00"
    dailyPrayer: string; // "12:00"
    readingReminder: string; // "20:00"
  };
  readingGoal: number; // Chapters per day
}

export interface VerseCardDesign {
  id: string;
  title: string;
  bgClass: string;
  textClass: string;
}
