export interface BibleBook {
  name: string;
  abbreviation: string;
  chapters: number;
  testament: 'Old' | 'New';
  category: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  // Law / Pentateuch
  { name: 'Genesis', abbreviation: 'Gen', chapters: 50, testament: 'Old', category: 'Pentateuch' },
  { name: 'Exodus', abbreviation: 'Exo', chapters: 40, testament: 'Old', category: 'Pentateuch' },
  { name: 'Leviticus', abbreviation: 'Lev', chapters: 27, testament: 'Old', category: 'Pentateuch' },
  { name: 'Numbers', abbreviation: 'Num', chapters: 36, testament: 'Old', category: 'Pentateuch' },
  { name: 'Deuteronomy', abbreviation: 'Deu', chapters: 34, testament: 'Old', category: 'Pentateuch' },
  
  // History
  { name: 'Joshua', abbreviation: 'Jos', chapters: 24, testament: 'Old', category: 'History' },
  { name: 'Judges', abbreviation: 'Jud', chapters: 21, testament: 'Old', category: 'History' },
  { name: 'Ruth', abbreviation: 'Rut', chapters: 4, testament: 'Old', category: 'History' },
  { name: '1 Samuel', abbreviation: '1Sa', chapters: 31, testament: 'Old', category: 'History' },
  { name: '2 Samuel', abbreviation: '2Sa', chapters: 24, testament: 'Old', category: 'History' },
  { name: '1 Kings', abbreviation: '1Ki', chapters: 22, testament: 'Old', category: 'History' },
  { name: '2 Kings', abbreviation: '2Ki', chapters: 25, testament: 'Old', category: 'History' },
  { name: '1 Chronicles', abbreviation: '1Ch', chapters: 29, testament: 'Old', category: 'History' },
  { name: '2 Chronicles', abbreviation: '2Ch', chapters: 36, testament: 'Old', category: 'History' },
  { name: 'Ezra', abbreviation: 'Ezr', chapters: 10, testament: 'Old', category: 'History' },
  { name: 'Nehemiah', abbreviation: 'Neh', chapters: 13, testament: 'Old', category: 'History' },
  { name: 'Esther', abbreviation: 'Est', chapters: 10, testament: 'Old', category: 'History' },
  
  // Poetry / Wisdom
  { name: 'Job', abbreviation: 'Job', chapters: 42, testament: 'Old', category: 'Wisdom' },
  { name: 'Psalms', abbreviation: 'Psa', chapters: 150, testament: 'Old', category: 'Wisdom' },
  { name: 'Proverbs', abbreviation: 'Pro', chapters: 31, testament: 'Old', category: 'Wisdom' },
  { name: 'Ecclesiastes', abbreviation: 'Ecc', chapters: 12, testament: 'Old', category: 'Wisdom' },
  { name: 'Song of Solomon', abbreviation: 'Sng', chapters: 8, testament: 'Old', category: 'Wisdom' },
  
  // Major Prophets
  { name: 'Isaiah', abbreviation: 'Isa', chapters: 66, testament: 'Old', category: 'Prophets' },
  { name: 'Jeremiah', abbreviation: 'Jer', chapters: 52, testament: 'Old', category: 'Prophets' },
  { name: 'Lamentations', abbreviation: 'Lam', chapters: 5, testament: 'Old', category: 'Prophets' },
  { name: 'Ezekiel', abbreviation: 'Eze', chapters: 48, testament: 'Old', category: 'Prophets' },
  { name: 'Daniel', abbreviation: 'Dan', chapters: 12, testament: 'Old', category: 'Prophets' },
  
  // Minor Prophets
  { name: 'Hosea', abbreviation: 'Hos', chapters: 14, testament: 'Old', category: 'Prophets' },
  { name: 'Joel', abbreviation: 'Joe', chapters: 3, testament: 'Old', category: 'Prophets' },
  { name: 'Amos', abbreviation: 'Amo', chapters: 9, testament: 'Old', category: 'Prophets' },
  { name: 'Obadiah', abbreviation: 'Oba', chapters: 1, testament: 'Old', category: 'Prophets' },
  { name: 'Jonah', abbreviation: 'Jon', chapters: 4, testament: 'Old', category: 'Prophets' },
  { name: 'Micah', abbreviation: 'Mic', chapters: 7, testament: 'Old', category: 'Prophets' },
  { name: 'Nahum', abbreviation: 'Nah', chapters: 3, testament: 'Old', category: 'Prophets' },
  { name: 'Habakkuk', abbreviation: 'Hab', chapters: 3, testament: 'Old', category: 'Prophets' },
  { name: 'Zephaniah', abbreviation: 'Zep', chapters: 3, testament: 'Old', category: 'Prophets' },
  { name: 'Haggai', abbreviation: 'Hag', chapters: 2, testament: 'Old', category: 'Prophets' },
  { name: 'Zechariah', abbreviation: 'Zec', chapters: 14, testament: 'Old', category: 'Prophets' },
  { name: 'Malachi', abbreviation: 'Mal', chapters: 4, testament: 'Old', category: 'Prophets' },

  // New Testament
  // Gospels
  { name: 'Matthew', abbreviation: 'Mat', chapters: 28, testament: 'New', category: 'Gospels' },
  { name: 'Mark', abbreviation: 'Mrk', chapters: 16, testament: 'New', category: 'Gospels' },
  { name: 'Luke', abbreviation: 'Luk', chapters: 24, testament: 'New', category: 'Gospels' },
  { name: 'John', abbreviation: 'Jhn', chapters: 21, testament: 'New', category: 'Gospels' },
  
  // History
  { name: 'Acts', abbreviation: 'Act', chapters: 28, testament: 'New', category: 'History' },
  
  // Paul's Epistles
  { name: 'Romans', abbreviation: 'Rom', chapters: 16, testament: 'New', category: 'Epistles' },
  { name: '1 Corinthians', abbreviation: '1Co', chapters: 16, testament: 'New', category: 'Epistles' },
  { name: '2 Corinthians', abbreviation: '2Co', chapters: 13, testament: 'New', category: 'Epistles' },
  { name: 'Galatians', abbreviation: 'Gal', chapters: 6, testament: 'New', category: 'Epistles' },
  { name: 'Ephesians', abbreviation: 'Eph', chapters: 6, testament: 'New', category: 'Epistles' },
  { name: 'Philippians', abbreviation: 'Php', chapters: 4, testament: 'New', category: 'Epistles' },
  { name: 'Colossians', abbreviation: 'Col', chapters: 4, testament: 'New', category: 'Epistles' },
  { name: '1 Thessalonians', abbreviation: '1Th', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '2 Thessalonians', abbreviation: '2Th', chapters: 3, testament: 'New', category: 'Epistles' },
  { name: '1 Timothy', abbreviation: '1Ti', chapters: 6, testament: 'New', category: 'Epistles' },
  { name: '2 Timothy', abbreviation: '2Ti', chapters: 4, testament: 'New', category: 'Epistles' },
  { name: 'Titus', abbreviation: 'Tit', chapters: 3, testament: 'New', category: 'Epistles' },
  { name: 'Philemon', abbreviation: 'Phm', chapters: 1, testament: 'New', category: 'Epistles' },
  
  // General Epistles
  { name: 'Hebrews', abbreviation: 'Heb', chapters: 13, testament: 'New', category: 'Epistles' },
  { name: 'James', abbreviation: 'Jas', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '1 Peter', abbreviation: '1Pe', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '2 Peter', abbreviation: '2Pe', chapters: 3, testament: 'New', category: 'Epistles' },
  { name: '1 John', abbreviation: '1Jn', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '2 John', abbreviation: '2Jn', chapters: 1, testament: 'New', category: 'Epistles' },
  { name: '3 John', abbreviation: '3Jn', chapters: 1, testament: 'New', category: 'Epistles' },
  { name: 'Jude', abbreviation: 'Jud', chapters: 1, testament: 'New', category: 'Epistles' },
  
  // Prophecy
  { name: 'Revelation', abbreviation: 'Rev', chapters: 22, testament: 'New', category: 'Prophecy' }
];

export interface Translation {
  id: string;
  name: string;
  description: string;
}

export const TRANSLATIONS: Translation[] = [
  { id: 'KJV', name: 'King James Version', description: 'Authorized King James Version' },
  { id: 'NKJV', name: 'New King James Version', description: 'New King James Version' },
  { id: 'NIV', name: 'New International Version', description: 'New International Version' },
  { id: 'ESV', name: 'English Standard Version', description: 'English Standard Version' },
  { id: 'NLT', name: 'New Living Translation', description: 'New Living Translation' },
  { id: 'NASB', name: 'New American Standard Bible', description: 'New American Standard Bible' },
  { id: 'CSB', name: 'Christian Standard Bible', description: 'Christian Standard Bible' }
];

// Offline fallback verses for beloved chapters, so the app is immediately usable even if offline or if scraping fails.
export interface OfflineChapter {
  book: string;
  chapter: number;
  translation: string;
  verses: { number: number; text: string }[];
}

export const OFFLINE_FALLBACKS: OfflineChapter[] = [
  {
    book: 'Joshua',
    chapter: 4,
    translation: 'NIV',
    verses: [
      { number: 1, text: 'When the whole nation had finished crossing the Jordan, the LORD said to Joshua,' },
      { number: 2, text: '“Choose twelve men from among the people, one from each tribe,' },
      { number: 3, text: 'and tell them to take up twelve stones from the middle of the Jordan, from right where the priests are standing, and carry them over with you and put them down at the place where you stay tonight.”' },
      { number: 4, text: 'So Joshua called together the twelve men he had appointed from the Israelites, one from each tribe,' },
      { number: 5, text: 'and said to them, “Go over before the ark of the LORD your God into the middle of the Jordan. Each of you is to take up a stone on his shoulder, according to the number of the tribes of the Israelites,' },
      { number: 6, text: 'to serve as a sign among you. In the future, when your children ask you, ‘What do these stones mean?’' },
      { number: 7, text: 'tell them that the flow of the Jordan was cut off before the ark of the covenant of the LORD. When it crossed the Jordan, the waters of the Jordan were cut off. These stones are to be a memorial to the people of Israel forever.”' }
    ]
  },
  {
    book: 'Joshua',
    chapter: 4,
    translation: 'KJV',
    verses: [
      { number: 1, text: 'And it came to pass, when all the people were clean passed over Jordan, that the LORD spake unto Joshua, saying,' },
      { number: 2, text: 'Take you twelve men out of the people, out of every tribe a man,' },
      { number: 3, text: 'And command ye them, saying, Take you hence out of the midst of Jordan, out of the place where the priests\' feet stood firm, twelve stones, and ye shall carry them over with you, and leave them in the lodging place, where ye shall lodge this night.' },
      { number: 4, text: 'Then Joshua called the twelve men, whom he had prepared of the children of Israel, out of every tribe a man:' },
      { number: 5, text: 'And Joshua said unto them, Pass over before the ark of the LORD your God into the midst of Jordan, and take ye up every man of you a stone upon his shoulder, according unto the number of the tribes of the children of Israel:' },
      { number: 6, text: 'That this may be a sign among you, that when your children ask their fathers in time to come, saying, What mean ye by these stones?' },
      { number: 7, text: 'Then ye shall answer them, That the waters of Jordan were cut off before the ark of the covenant of the LORD; when it passed over Jordan, the waters of Jordan were cut off: and these stones shall be for a memorial unto the children of Israel for ever.' }
    ]
  },
  {
    book: 'Genesis',
    chapter: 1,
    translation: 'KJV',
    verses: [
      { number: 1, text: 'In the beginning God created the heaven and the earth.' },
      { number: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
      { number: 3, text: 'And God said, Let there be light: and there was light.' },
      { number: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
      { number: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
      { number: 6, text: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.' },
      { number: 7, text: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.' },
      { number: 8, text: 'And God called the firmament Heaven. And the evening and the morning were the second day.' },
      { number: 9, text: 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.' },
      { number: 10, text: 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.' }
    ]
  },
  {
    book: 'John',
    chapter: 3,
    translation: 'KJV',
    verses: [
      { number: 1, text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:' },
      { number: 2, text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.' },
      { number: 3, text: 'Jesus answered and said unto him, Verily, verily, say unto thee, Except a man be born again, he cannot see the kingdom of God.' },
      { number: 4, text: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother\'s womb, and be born?' },
      { number: 5, text: 'Jesus answered, Verily, verily, say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.' },
      { number: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { number: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
      { number: 18, text: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.' }
    ]
  },
  {
    book: 'Psalms',
    chapter: 23,
    translation: 'KJV',
    verses: [
      { number: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { number: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { number: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
      { number: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { number: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { number: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' }
    ]
  }
];
