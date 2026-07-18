import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleBooks';

interface BookSelectorViewProps {
  onSelectBookChapter: (book: string, chapter: number) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export default function BookSelectorView({ onSelectBookChapter, onClose, theme = 'dark' }: BookSelectorViewProps) {
  const [activeTab, setActiveTab] = useState<'Old' | 'New'>('Old');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);

  const isLight = theme === 'light';

  // Filter books based on active testament tab and search query
  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    const matchesTab = book.testament === activeTab;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleBookClick = (book: BibleBook) => {
    setSelectedBook(book);
  };

  const handleChapterClick = (chapterNum: number) => {
    if (selectedBook) {
      onSelectBookChapter(selectedBook.name, chapterNum);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
  };

  // Group books by categories for an editorial feel
  const categoriesMap: { [key: string]: BibleBook[] } = {};
  filteredBooks.forEach((book) => {
    if (!categoriesMap[book.category]) {
      categoriesMap[book.category] = [];
    }
    categoriesMap[book.category].push(book);
  });

  return (
    <div className={`fixed inset-0 z-45 flex flex-col transition-colors duration-200 ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-black text-zinc-100'}`} id="book-selector-overlay">
      
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? 'border-zinc-200 bg-white' : 'border-zinc-900 bg-black'}`}>
        <div className="flex items-center gap-3">
          {selectedBook ? (
            <button 
              onClick={handleBackToBooks}
              className={`p-1.5 rounded-full transition-colors ${isLight ? 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950' : 'hover:bg-[#121212] text-zinc-400 hover:text-zinc-100'}`}
              aria-label="Back to books list"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${isLight ? 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950' : 'hover:bg-[#121212] text-zinc-400 hover:text-zinc-100'}`}
              aria-label="Close book selector"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="font-sans font-extrabold text-base tracking-tight">
            {selectedBook ? `${selectedBook.name} Chapters` : 'Books'}
          </h2>
        </div>
        {!selectedBook && (
          <span className={`font-sans text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border rounded-full ${isLight ? 'text-zinc-500 bg-zinc-150 border-zinc-250' : 'text-zinc-500 bg-[#121212] border-zinc-900'}`}>
            KJV INDEX
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-6">
        {selectedBook ? (
          /* Chapters Selection Grid */
          <div className="p-6 space-y-6 animate-in fade-in duration-250">
            <div className={`flex items-center gap-2 justify-between pb-3 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-900'}`}>
              <div>
                <h3 className="font-sans font-black text-2xl">{selectedBook.name}</h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{selectedBook.testament} Testament • {selectedBook.category}</p>
              </div>
              <Compass className={`w-5 h-5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`} />
            </div>

            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapterNum) => (
                <button
                  key={chapterNum}
                  onClick={() => handleChapterClick(chapterNum)}
                  className={`aspect-square rounded-[18px] font-sans font-extrabold text-base flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800' 
                      : 'bg-[#121212] hover:bg-[#1c1c1c] border border-zinc-900 hover:border-zinc-800 text-zinc-200'
                  }`}
                >
                  {chapterNum}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Books Selection Lists */
          <>
            {/* Search and Tabs */}
            <div className={`p-6 border-b space-y-4 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black border-zinc-900'}`}>
              {/* Tabs */}
              <div className={`flex p-1 rounded-2xl border ${isLight ? 'bg-zinc-150 border-zinc-200' : 'bg-[#121212] border-zinc-900/60'}`}>
                <button
                  onClick={() => {
                    setActiveTab('Old');
                    setSearchQuery('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'Old'
                      ? (isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-100 text-black shadow-md')
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Old Testament
                </button>
                <button
                  onClick={() => {
                    setActiveTab('New');
                    setSearchQuery('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'New'
                      ? (isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-100 text-black shadow-md')
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  New Testament
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex items-center">
                <Search className="absolute left-4.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} Testament books...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs placeholder-zinc-500 focus:outline-none transition-colors ${
                    isLight 
                      ? 'bg-white border border-zinc-200 focus:border-zinc-400 text-zinc-800' 
                      : 'bg-[#121212] border border-zinc-900 focus:border-[#e9ae34]/25 text-zinc-200'
                  }`}
                />
              </div>
            </div>

            {/* Books List Grouped by categories */}
            <div className="flex-1 px-6 space-y-6 pt-4">
              {Object.keys(categoriesMap).length > 0 ? (
                Object.keys(categoriesMap).map((catName) => (
                  <div key={catName} className="space-y-3">
                    <h4 className={`font-sans font-bold text-[10px] uppercase tracking-widest px-1 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {catName}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {categoriesMap[catName].map((book) => (
                        <button
                          key={book.name}
                          onClick={() => handleBookClick(book)}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-[22px] transition-all text-left active:scale-[0.99] group cursor-pointer border ${
                            isLight 
                              ? 'bg-white hover:bg-zinc-100/50 border-zinc-200 hover:border-zinc-300 shadow-sm' 
                              : 'bg-[#121212] hover:bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <img 
                              src="https://i.ibb.co/NRBK22V/jawadmd.jpg" 
                              alt="IGWT Logo" 
                              className="w-9 h-9 rounded-xl object-cover border border-zinc-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-0.5">
                              <span className={`font-sans font-extrabold text-sm transition-colors ${
                                isLight 
                                  ? 'text-zinc-800 group-hover:text-black' 
                                  : 'text-zinc-200 group-hover:text-white'
                              }`}>
                                {book.name}
                              </span>
                              <span className={`block font-sans text-[10px] font-semibold tracking-tight transition-colors duration-200 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {book.chapters} chapters • {book.category}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="font-sans text-xs text-zinc-500">No books matched your search.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
