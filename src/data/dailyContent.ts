export interface VerseOfTheDay {
  reference: string;
  book: string;
  chapter: number;
  verseNum: number;
  text: string;
  translation: string;
}

export interface DailyPrayer {
  title: string;
  prayer: string;
  topic: string;
}

export interface Encouragement {
  text: string;
  author: string;
}

export const VERSE_CARDS_DESIGNS = [
  { id: 'gold', title: 'Imperial Gold', bgClass: 'bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0A0A0A] border border-gold-500/30', textClass: 'text-gold-400 font-serif' },
  { id: 'royal', title: 'Royal Onyx', bgClass: 'bg-black border border-zinc-800', textClass: 'text-zinc-100 font-serif' },
  { id: 'linen', title: 'Sacred Linen', bgClass: 'bg-stone-900 border border-stone-800', textClass: 'text-stone-200 font-serif' },
  { id: 'emerald', title: 'Sacred Emerald', bgClass: 'bg-zinc-950 border border-emerald-900/30', textClass: 'text-emerald-400 font-serif' },
  { id: 'morning', title: 'Sabbath Slate', bgClass: 'bg-[#0E1116] border border-slate-800', textClass: 'text-slate-200 font-serif' },
];

export const DAILY_VERSES: VerseOfTheDay[] = [
  {
    reference: 'Philippians 4:7',
    book: 'Philippians',
    chapter: 4,
    verseNum: 7,
    text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    translation: 'NIV'
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verseNum: 13,
    text: 'I can do all things through Christ which strengtheneth me.',
    translation: 'KJV'
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verseNum: 5,
    text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    translation: 'KJV'
  },
  {
    reference: 'Isaiah 41:10',
    book: 'Isaiah',
    chapter: 41,
    verseNum: 10,
    text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
    translation: 'KJV'
  },
  {
    reference: 'Romans 8:28',
    book: 'Romans',
    chapter: 8,
    verseNum: 28,
    text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    translation: 'KJV'
  },
  {
    reference: 'Joshua 1:9',
    book: 'Joshua',
    chapter: 1,
    verseNum: 9,
    text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
    translation: 'KJV'
  },
  {
    reference: 'Psalm 23:1',
    book: 'Psalms',
    chapter: 23,
    verseNum: 1,
    text: 'The LORD is my shepherd; I shall not want.',
    translation: 'KJV'
  },
  {
    reference: 'Hebrews 11:1',
    book: 'Hebrews',
    chapter: 11,
    verseNum: 1,
    text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
    translation: 'KJV'
  },
  {
    reference: 'John 14:6',
    book: 'John',
    chapter: 14,
    verseNum: 6,
    text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.',
    translation: 'KJV'
  },
  {
    reference: 'Matthew 6:33',
    book: 'Matthew',
    chapter: 6,
    verseNum: 33,
    text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
    translation: 'KJV'
  }
];

export const DAILY_PRAYERS: DailyPrayer[] = [
  {
    title: 'A Prayer of Thanks for God\'s Peace',
    prayer: 'Heavenly Father, I thank You for Your perfect peace that transcends all understanding. When the world is chaotic and my heart is anxious, remind me of Your presence. Guard my heart and mind in Christ Jesus, and let Your peace rule in me today and always. Amen.',
    topic: 'Peace'
  },
  {
    title: 'A Prayer for Wisdom & Guidance',
    prayer: 'Heavenly Father, I stand before You today seeking Your absolute wisdom. Guide my footsteps, direct my thoughts, and grant me the discernment to see Your truth amidst the noise of the world. Align my desires with Your perfect plan, and let my life reflect Your goodness in everything I do. In Jesus\' name, Amen.',
    topic: 'Wisdom'
  },
  {
    title: 'A Prayer for Strength and Protection',
    prayer: 'Almighty God, You are my refuge and my fortress. I ask for Your strength to overcome the trials of this day. Shelter me under Your wings, shield my mind from anxiety, and keep my family safe from harm. Fill my heart with Your perfect peace that surpasses all understanding. In Jesus\' name, Amen.',
    topic: 'Strength'
  },
  {
    title: 'A Prayer for Abundant Gratitude',
    prayer: 'Gracious Lord, thank You for the gift of life and the endless blessings You pour into my heart. Forgive me for the moments I take Your grace for granted. Teach me to count my blessings daily, and let my words be a source of encouragement and love to everyone I meet today. Amen.',
    topic: 'Gratitude'
  },
  {
    title: 'A Prayer for Healing & Restoration',
    prayer: 'Loving Savior, I lift up all who are suffering in body, mind, or spirit. You are the Great Physician, and nothing is impossible for You. Lay Your healing hand upon us, restore our strength, and bind our wounds. Give us the patience and faith to trust in Your perfect timing. In Jesus\' name, Amen.',
    topic: 'Healing'
  }
];

export const ENCOURAGEMENTS: Encouragement[] = [
  { text: 'God never directs our footsteps into anything that His grace cannot sustain.', author: 'Faithful Reminder' },
  { text: 'Your current situation is not your final destination. God is working all things together for your good.', author: 'Grace & Truth' },
  { text: 'When the world is shaking, remember that the Rock under your feet is immoveable.', author: 'Eternal Assurance' },
  { text: 'Peace is not the absence of trouble, but the presence of Christ in the midst of it.', author: 'Christian Wisdom' },
  { text: 'Prayer does not just change things; it changes us, aligning our hearts with God\'s sovereign will.', author: 'Spiritual Life' }
];

export const getVerseOfTheDay = (): VerseOfTheDay => {
  return DAILY_VERSES[0];
};

export const getDailyPrayer = (): DailyPrayer => {
  return DAILY_PRAYERS[0];
};

export const getEncouragement = (): Encouragement => {
  const day = new Date().getDate();
  const index = (day - 1) % ENCOURAGEMENTS.length;
  return ENCOURAGEMENTS[index];
};
