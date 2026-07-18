import { useState, useEffect } from 'react';
import { Search, Clock, ChevronRight, BookOpen, Sparkles, Compass } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleBooks';
import { OFFLINE_FALLBACKS } from '../data/bibleBooks';

interface SearchViewProps {
  onNavigateToVerse: (book: string, chapter: number, verseNum: number) => void;
  cachedChapters: { [key: string]: { book: string; chapter: number; translation: string; verses: any[] } };
}

interface SearchResult {
  book: string;
  chapter: number;
  verseNum: number;
  text: string;
  reference: string;
}

export default function SearchView({ onNavigateToVerse, cachedChapters }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('igwt_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim();
    const updated = [cleanQuery, ...recentSearches.filter((s) => s !== cleanQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('igwt_recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('igwt_recent_searches');
  };

  // Perform the search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase().trim();

      // 1. Check if the query is a direct reference (e.g., "John 3 16" or "Genesis 1:1" or "John 3:16")
      const refMatch = q.match(/^([\d\s]*[a-zA-Z]+)\s+(\d+)(?:\s+|:)(\d+)$/);
      if (refMatch) {
        const bookQuery = refMatch[1].replace(/\s+/g, ' ').trim();
        const chapterNum = parseInt(refMatch[2], 10);
        const verseNum = parseInt(refMatch[3], 10);

        // Find matching book
        const bookMatch = BIBLE_BOOKS.find(
          (b) => b.name.toLowerCase() === bookQuery || b.abbreviation.toLowerCase() === bookQuery
        );

        if (bookMatch && chapterNum <= bookMatch.chapters) {
          // Check if we have this verse cached or in fallbacks
          let foundText = '';
          
          // Check fallbacks
          const fallback = OFFLINE_FALLBACKS.find(
            (f) => f.book.toLowerCase() === bookMatch.name.toLowerCase() && f.chapter === chapterNum
          );
          if (fallback) {
            const v = fallback.verses.find((vs) => vs.number === verseNum);
            if (v) foundText = v.text;
          }

          // Check caches
          if (!foundText) {
            const cacheKey = `${bookMatch.name}_${chapterNum}_KJV`.toLowerCase();
            const cached = cachedChapters[cacheKey];
            if (cached) {
              const v = cached.verses.find((vs) => vs.number === verseNum);
              if (v) foundText = v.text;
            }
          }

          if (foundText) {
            setResults([
              {
                book: bookMatch.name,
                chapter: chapterNum,
                verseNum,
                text: foundText,
                reference: `${bookMatch.name} ${chapterNum}:${verseNum}`
              }
            ]);
            return;
          } else {
            // Even if the exact verse text is not offline, offer a direct navigation target
            setResults([
              {
                book: bookMatch.name,
                chapter: chapterNum,
                verseNum,
                text: `Tap below to load and read this verse in the Bible Reader.`,
                reference: `${bookMatch.name} ${chapterNum}:${verseNum}`
              }
            ]);
            return;
          }
        }
      }

      // 2. Fallback: Search keywords in offline fallback scriptures, cached scriptures, and a preloaded search index of beloved verses
      const matching: SearchResult[] = [];

      // Famous indexed verses database for search completeness
      const FAMOUS_INDEX: SearchResult[] = [
        { book: 'John', chapter: 3, verseNum: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', reference: 'John 3:16' },
        { book: 'Romans', chapter: 8, verseNum: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', reference: 'Romans 8:28' },
        { book: 'Romans', chapter: 12, verseNum: 2, text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.', reference: 'Romans 12:2' },
        { book: 'Philippians', chapter: 4, verseNum: 13, text: 'I can do all things through Christ which strengtheneth me.', reference: 'Philippians 4:13' },
        { book: 'Proverbs', chapter: 3, verseNum: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', reference: 'Proverbs 3:5' },
        { book: 'Proverbs', chapter: 3, verseNum: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.', reference: 'Proverbs 3:6' },
        { book: 'Genesis', chapter: 1, verseNum: 1, text: 'In the beginning God created the heaven and the earth.', reference: 'Genesis 1:1' },
        { book: 'Isaiah', chapter: 40, verseNum: 31, text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', reference: 'Isaiah 40:31' },
        { book: 'Isaiah', chapter: 41, verseNum: 10, text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.', reference: 'Isaiah 41:10' },
        { book: 'Hebrews', chapter: 11, verseNum: 1, text: 'Now faith is the substance of things hoped for, the evidence of things not seen.', reference: 'Hebrews 11:1' },
        { book: 'Matthew', chapter: 6, verseNum: 33, text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.', reference: 'Matthew 6:33' },
        { book: 'Psalm', chapter: 23, verseNum: 1, text: 'The LORD is my shepherd; I shall not want.', reference: 'Psalm 23:1' },
        { book: 'Psalm', chapter: 23, verseNum: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.', reference: 'Psalm 23:4' }
      ];

      // Search fallbacks
      OFFLINE_FALLBACKS.forEach((chap) => {
        chap.verses.forEach((v) => {
          if (v.text.toLowerCase().includes(q)) {
            matching.push({
              book: chap.book,
              chapter: chap.chapter,
              verseNum: v.number,
              text: v.text,
              reference: `${chap.book} ${chap.chapter}:${v.number}`
            });
          }
        });
      });

      // Search cached chapters
      Object.keys(cachedChapters).forEach((key) => {
        const chap = cachedChapters[key];
        chap.verses.forEach((v) => {
          const alreadyAdded = matching.some(
            (m) => m.book === chap.book && m.chapter === chap.chapter && m.verseNum === v.number
          );
          if (!alreadyAdded && v.text.toLowerCase().includes(q)) {
            matching.push({
              book: chap.book,
              chapter: chap.chapter,
              verseNum: v.number,
              text: v.text,
              reference: `${chap.book} ${chap.chapter}:${v.number}`
            });
          }
        });
      });

      // Search famous indexed database
      FAMOUS_INDEX.forEach((item) => {
        const alreadyAdded = matching.some(
          (m) => m.book === item.book && m.chapter === item.chapter && m.verseNum === item.verseNum
        );
        if (!alreadyAdded && item.text.toLowerCase().includes(q)) {
          matching.push(item);
        }
      });

      setResults(matching.slice(0, 30)); // Cap at 30 entries for speed
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, cachedChapters]);

  const handleResultClick = (res: SearchResult) => {
    saveRecentSearch(searchQuery);
    onNavigateToVerse(res.book, res.chapter, res.verseNum);
  };

  const handleRecentClick = (query: string) => {
    setSearchQuery(query);
  };

  // Split and mark text highlights cleanly
  const renderHighlightedText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-gold-500/30 text-gold-400 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 pb-24 px-4 max-w-md mx-auto" id="search-tab-content">
      {/* Search Header */}
      <div className="pt-6">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Search className="w-6 h-6 text-gold-500" />
          Scripture Search
        </h1>
        <p className="font-sans text-xs text-zinc-500 mt-1">Search by keyword or direct Bible reference</p>
      </div>

      {/* Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search e.g., 'faith', 'John 3:16'"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-zinc-950 border border-zinc-900 focus:border-gold-500/30 rounded-2xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
        />
      </div>

      {/* Recent Searches / Results list */}
      {!searchQuery.trim() ? (
        <div className="space-y-4">
          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest font-semibold">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="font-sans text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentClick(query)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-zinc-950/40 hover:bg-zinc-900/60 border border-zinc-900/40 hover:border-zinc-800 text-left text-sm text-zinc-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      <span>{query}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-3 bg-zinc-950/20 rounded-3xl border border-zinc-900/30">
              <Compass className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="font-sans text-xs text-zinc-500">
                Type search terms above.<br />
                Try typing <span className="text-gold-500 font-medium font-mono">John 3:16</span> or <span className="text-gold-500 font-medium font-mono">love</span>.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest font-semibold">
              Search Results ({results.length})
            </span>
            <Sparkles className="w-4 h-4 text-gold-500/40" />
          </div>

          <div className="space-y-3">
            {results.length > 0 ? (
              results.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => handleResultClick(res)}
                  className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer space-y-2.5 active:scale-[0.99]"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-bold text-sm text-gold-400">
                      {res.reference}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-zinc-300">
                    “{renderHighlightedText(res.text, searchQuery)}”
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="font-sans text-sm text-zinc-500">No scriptures matched your query offline.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
