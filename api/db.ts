import { MongoClient, Db, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://oluwagbemiga183_db_user:GRErFg1miJMoz4le@igwtbible.u4ccf3v.mongodb.net/?appName=igwtbible";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db | null> {
  if (db) return db;
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        connectTimeoutMS: 3000,
        socketTimeoutMS: 5000,
      });
      await client.connect();
      console.log('[MongoDB] Connection established to Cluster');
    }
    db = client.db('igwtbible');
    return db;
  } catch (error: any) {
    console.error('[MongoDB] Failed to connect to database:', error.message);
    return null;
  }
}

// In-memory fallback if MongoDB connection fails
const fallbackDb: {
  users: any[];
  progress: any[];
  highlights: any[];
  bookmarks: any[];
  notes: any[];
} = {
  users: [],
  progress: [],
  highlights: [],
  bookmarks: [],
  notes: [],
};

export async function findUserByEmail(email: string) {
  const database = await getDb();
  if (database) {
    return await database.collection('users').findOne({ email: email.toLowerCase() });
  }
  return fallbackDb.users.find(u => u.email === email.toLowerCase()) || null;
}

export async function findUserById(id: string) {
  const database = await getDb();
  if (database) {
    try {
      return await database.collection('users').findOne({ _id: new ObjectId(id) });
    } catch {
      return null;
    }
  }
  return fallbackDb.users.find(u => u._id === id) || null;
}

export async function createUser(user: { email: string; passwordHash: string; name: string }) {
  const database = await getDb();
  const newUser = {
    ...user,
    email: user.email.toLowerCase(),
    createdAt: new Date(),
  };
  
  if (database) {
    const result = await database.collection('users').insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  } else {
    const mockId = Math.random().toString(36).substring(7);
    const mockUser = { ...newUser, _id: mockId };
    fallbackDb.users.push(mockUser);
    return mockUser;
  }
}

export async function getReadingProgress(userId: string) {
  const database = await getDb();
  if (database) {
    return await database.collection('progress').find({ userId }).toArray();
  }
  return fallbackDb.progress.filter(p => p.userId === userId);
}

export async function saveReadingProgress(userId: string, book: string, chapter: number, completed: boolean) {
  const database = await getDb();
  const query = { userId, book, chapter };
  
  if (completed) {
    const doc = { ...query, completedAt: new Date() };
    if (database) {
      await database.collection('progress').updateOne(
        query,
        { $set: doc },
        { upsert: true }
      );
    } else {
      const existingIdx = fallbackDb.progress.findIndex(p => p.userId === userId && p.book === book && p.chapter === chapter);
      if (existingIdx >= 0) {
        fallbackDb.progress[existingIdx] = doc;
      } else {
        fallbackDb.progress.push(doc);
      }
    }
  } else {
    if (database) {
      await database.collection('progress').deleteOne(query);
    } else {
      fallbackDb.progress = fallbackDb.progress.filter(p => !(p.userId === userId && p.book === book && p.chapter === chapter));
    }
  }
}

export async function syncUserData(userId: string, data: {
  highlights: any[];
  bookmarks: any[];
  notes: any[];
  progress: any[];
}) {
  const database = await getDb();
  if (!database) {
    // If database is offline, just echo back the local data
    return data;
  }

  // 1. Sync Highlights: merge local & remote
  const userHighlightsCol = database.collection('highlights');
  if (data.highlights && data.highlights.length > 0) {
    for (const h of data.highlights) {
      const q = { userId, id: h.id };
      await userHighlightsCol.updateOne(q, { $set: { userId, ...h } }, { upsert: true });
    }
  }
  const dbHighlights = await userHighlightsCol.find({ userId }).toArray();

  // 2. Sync Bookmarks
  const userBookmarksCol = database.collection('bookmarks');
  if (data.bookmarks && data.bookmarks.length > 0) {
    for (const b of data.bookmarks) {
      const q = { userId, id: b.id };
      await userBookmarksCol.updateOne(q, { $set: { userId, ...b } }, { upsert: true });
    }
  }
  const dbBookmarks = await userBookmarksCol.find({ userId }).toArray();

  // 3. Sync Notes
  const userNotesCol = database.collection('notes');
  if (data.notes && data.notes.length > 0) {
    for (const n of data.notes) {
      const q = { userId, id: n.id };
      await userNotesCol.updateOne(q, { $set: { userId, ...n } }, { upsert: true });
    }
  }
  const dbNotes = await userNotesCol.find({ userId }).toArray();

  // 4. Sync Progress
  const userProgressCol = database.collection('progress');
  if (data.progress && data.progress.length > 0) {
    for (const p of data.progress) {
      const q = { userId, book: p.book, chapter: p.chapter };
      await userProgressCol.updateOne(q, { $set: { userId, ...p } }, { upsert: true });
    }
  }
  const dbProgress = await userProgressCol.find({ userId }).toArray();

  return {
    highlights: dbHighlights.map(({ _id, userId, ...rest }) => rest),
    bookmarks: dbBookmarks.map(({ _id, userId, ...rest }) => rest),
    notes: dbNotes.map(({ _id, userId, ...rest }) => rest),
    progress: dbProgress.map(({ _id, userId, ...rest }) => rest)
  };
}
