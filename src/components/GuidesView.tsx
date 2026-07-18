import { useState } from 'react';
import { Search, Map, Calendar, ArrowRight, CheckCircle2, Star, Sparkles, BookOpen } from 'lucide-react';

interface GuidesViewProps {
  onNavigateToBible: (book: string, chapter: number, verseNum?: number) => void;
  theme?: 'light' | 'dark';
}

interface Plan {
  id: string;
  title: string;
  duration: string;
  category: string;
  author: string;
  completedDays: number;
  totalDays: number;
  description: string;
  days: { day: number; book: string; chapter: number; title: string }[];
}

export default function GuidesView({ onNavigateToBible, theme = 'dark' }: GuidesViewProps) {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedCategory, setSearchCategory] = useState<string | null>(null);

  const categories = ['Peace', 'Faith', 'Healing', 'Love', 'Strength', 'Wisdom'];

  const plans: Plan[] = [
    {
      id: 'peace',
      title: 'Unshakeable Peace',
      duration: '5 Days',
      category: 'Peace',
      author: 'YouVersion Devotional',
      completedDays: 1,
      totalDays: 5,
      description: 'Find comfort and guard your heart with the sovereign peace of God that surpasses all human understanding.',
      days: [
        { day: 1, book: 'Philippians', chapter: 4, title: 'Peace That Guards Your Heart' },
        { day: 2, book: 'John', chapter: 14, title: 'Let Not Your Heart Be Troubled' },
        { day: 3, book: 'Isaiah', chapter: 26, title: 'Perfect Peace in Him' },
        { day: 4, book: 'Psalms', chapter: 23, title: 'The Lord is My Shepherd' },
        { day: 5, book: 'Joshua', chapter: 1, title: 'Be Strong and Courageous' }
      ]
    },
    {
      id: 'faith',
      title: 'Walking by Faith',
      duration: '7 Days',
      category: 'Faith',
      author: 'Sacred Word Pub',
      completedDays: 0,
      totalDays: 7,
      description: 'Strengthen your conviction in things hoped for and find confidence in walking with God through uncertain times.',
      days: [
        { day: 1, book: 'Hebrews', chapter: 11, title: 'The Hall of Faith' },
        { day: 2, book: 'Proverbs', chapter: 3, title: 'Trust with All Your Heart' },
        { day: 3, book: 'Romans', chapter: 10, title: 'Faith Comes by Hearing' },
        { day: 4, book: 'James', chapter: 2, title: 'Faith and Works' },
        { day: 5, book: 'Genesis', chapter: 15, title: 'Abrahams Believing Heart' },
        { day: 6, book: 'Matthew', chapter: 17, title: 'Faith Like a Mustard Seed' },
        { day: 7, book: 'Mark', chapter: 11, title: 'Have Faith in God' }
      ]
    },
    {
      id: 'bible-year',
      title: 'Through the Bible in a Year',
      duration: '365 Days',
      category: 'Wisdom',
      author: 'Navigators Group',
      completedDays: 4,
      totalDays: 365,
      description: 'Journey through the entire narrative of scripture from Genesis to Revelation, uncovering God\'s redemption plan.',
      days: [
        { day: 1, book: 'Genesis', chapter: 1, title: 'In the Beginning' },
        { day: 2, book: 'Genesis', chapter: 2, title: 'The Garden of Eden' },
        { day: 3, book: 'Genesis', chapter: 3, title: 'The Fall of Man' },
        { day: 4, book: 'Genesis', chapter: 4, title: 'Cain and Abel' },
        { day: 5, book: 'Joshua', chapter: 4, title: 'Crossing the Jordan Stones' }
      ]
    }
  ];

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesCategory = !selectedCategory || plan.category === selectedCategory;
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen px-6 pt-8 pb-24 space-y-6 max-w-md mx-auto transition-colors duration-250 ${
      isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-black text-zinc-100'
    }`} id="guides-view">
      
      {/* Header */}
      {selectedPlan ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedPlan(null)}
            className={`p-1 transition-colors cursor-pointer text-xs font-bold ${
              isLight ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            ← Back to Guides
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            <Map className="w-5 h-5" />
            <span className="font-sans font-bold text-lg">Guides</span>
          </div>
          <h1 className={`font-sans font-black text-3xl tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            Reading Plans
          </h1>
          <div className="w-10" />
        </div>
      )}

      {selectedPlan ? (
        /* Detailed Plan View */
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#e9ae34]/10 border border-[#e9ae34]/20 text-[10px] uppercase font-mono tracking-wider text-[#e9ae34]">
              {selectedPlan.category} • {selectedPlan.duration}
            </span>
            <h2 className={`font-sans font-extrabold text-2xl ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{selectedPlan.title}</h2>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">{selectedPlan.description}</p>
            <div className="text-[10px] text-zinc-500 font-mono">Published by {selectedPlan.author}</div>
          </div>

          {/* Progress bar */}
          <div className={`space-y-2 p-4 rounded-3xl border transition-colors ${
            isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-zinc-900'
          }`}>
            <div className="flex justify-between text-xs font-semibold">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>My Progress</span>
              <span className={isLight ? 'text-zinc-850' : 'text-zinc-200'}>{selectedPlan.completedDays} of {selectedPlan.totalDays} Days</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
              <div 
                className="bg-[#e9ae34] h-full rounded-full transition-all duration-500"
                style={{ width: `${(selectedPlan.completedDays / selectedPlan.totalDays) * 100}%` }}
              />
            </div>
          </div>

          {/* Days Grid */}
          <div className="space-y-3">
            <h3 className={`font-sans font-bold text-sm uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Lessons</h3>
            <div className="space-y-2">
              {selectedPlan.days.map((day) => {
                const isCompleted = day.day <= selectedPlan.completedDays;
                return (
                  <div 
                    key={day.day}
                    onClick={() => onNavigateToBible(day.book, day.chapter)}
                    className={`flex items-center justify-between p-4 rounded-[22px] transition-all cursor-pointer group border ${
                      isLight 
                        ? 'bg-white border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50/50 shadow-xs' 
                        : 'bg-[#121212] border border-zinc-900/60 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-[#e9ae34]/10 text-[#e9ae34] border border-[#e9ae34]/20' : (isLight ? 'bg-zinc-100 text-zinc-400 border border-zinc-200' : 'bg-zinc-900 text-zinc-500')
                      }`}>
                        {isCompleted ? '✓' : day.day}
                      </div>
                      <div className="text-left">
                        <div className={`font-sans font-bold text-xs group-hover:text-[#e9ae34] transition-colors ${
                          isLight ? 'text-zinc-850' : 'text-zinc-200'
                        }`}>
                          {day.title}
                        </div>
                        <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                          {day.book} {day.chapter}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#e9ae34] transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List of Plans View */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search reading plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-xs focus:outline-none transition-colors ${
                isLight 
                  ? 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-450' 
                  : 'bg-[#121212] border border-zinc-900/60 text-zinc-200 placeholder-zinc-600 focus:border-[#e9ae34]/30'
              }`}
            />
          </div>

          {/* Categories Horizontal Scroller */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSearchCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === null 
                  ? (isLight ? 'bg-zinc-900 text-white border border-transparent' : 'bg-zinc-100 text-black border border-transparent') 
                  : (isLight ? 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900' : 'bg-[#121212] border border-zinc-900 text-zinc-400 hover:text-zinc-200')
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? (isLight ? 'bg-zinc-900 text-white border border-transparent' : 'bg-zinc-100 text-black border border-transparent') 
                    : (isLight ? 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900' : 'bg-[#121212] border border-zinc-900 text-zinc-400 hover:text-zinc-200')
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active / Featured Plan Card */}
          <div className={`p-6 rounded-[28px] border space-y-4 transition-colors ${
            isLight 
              ? 'bg-amber-500/5 border-[#e9ae34]/25 shadow-xs' 
              : 'bg-gradient-to-br from-[#1c1409] to-black border-[#e9ae34]/20'
          }`}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#e9ae34] fill-[#e9ae34]" />
              <span className="font-mono text-[9px] text-[#e9ae34] tracking-widest uppercase font-bold">Featured Guide</span>
            </div>
            <div className="space-y-1">
              <h3 className={`font-sans font-extrabold text-lg ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>Unshakeable Peace Devotional</h3>
              <p className={`font-sans text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Start our 5-day scriptural guide to quieten anxiety and experience divine stillness.
              </p>
            </div>
            <button
              onClick={() => setSelectedPlan(plans[0])}
              className="w-full py-3 bg-[#e9ae34] hover:bg-[#d99c25] text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg active:scale-95"
            >
              <span>Explore Guide</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Reading Plans List */}
          <div className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-500 px-1">Recommended Plans</h3>
            <div className="space-y-3">
              {filteredPlans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-5 rounded-[24px] border transition-all cursor-pointer space-y-3 text-left ${
                    isLight 
                      ? 'bg-white border-zinc-200 hover:border-zinc-350 shadow-xs' 
                      : 'bg-[#121212] border border-zinc-900/60 hover:border-zinc-850'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#e9ae34] font-semibold uppercase">{plan.category} • {plan.duration}</span>
                      <h4 className={`font-sans font-extrabold text-sm ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{plan.title}</h4>
                    </div>
                    {plan.completedDays > 0 && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${isLight ? 'text-zinc-550 bg-zinc-100' : 'text-zinc-500 bg-zinc-900'}`}>
                        {Math.round((plan.completedDays / plan.totalDays) * 100)}% done
                      </span>
                    )}
                  </div>
                  <p className={`font-sans text-xs leading-normal line-clamp-2 ${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>{plan.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
