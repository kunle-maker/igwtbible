var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_url = require("url");
var import_crypto = __toESM(require("crypto"), 1);

// api/db.ts
var import_mongodb = require("mongodb");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://oluwagbemiga183_db_user:GRErFg1miJMoz4le@igwtbible.u4ccf3v.mongodb.net/?appName=igwtbible";
var client = null;
var db = null;
async function getDb() {
  if (db) return db;
  try {
    if (!client) {
      client = new import_mongodb.MongoClient(MONGODB_URI, {
        connectTimeoutMS: 3e3,
        socketTimeoutMS: 5e3
      });
      await client.connect();
      console.log("[MongoDB] Connection established to Cluster");
    }
    db = client.db("igwtbible");
    return db;
  } catch (error) {
    console.error("[MongoDB] Failed to connect to database:", error.message);
    return null;
  }
}
var fallbackDb = {
  users: [],
  progress: [],
  highlights: [],
  bookmarks: [],
  notes: []
};
async function findUserByEmail(email) {
  const database = await getDb();
  if (database) {
    return await database.collection("users").findOne({ email: email.toLowerCase() });
  }
  return fallbackDb.users.find((u) => u.email === email.toLowerCase()) || null;
}
async function createUser(user) {
  const database = await getDb();
  const newUser = {
    ...user,
    email: user.email.toLowerCase(),
    createdAt: /* @__PURE__ */ new Date()
  };
  if (database) {
    const result = await database.collection("users").insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  } else {
    const mockId = Math.random().toString(36).substring(7);
    const mockUser = { ...newUser, _id: mockId };
    fallbackDb.users.push(mockUser);
    return mockUser;
  }
}
async function saveReadingProgress(userId, book, chapter, completed) {
  const database = await getDb();
  const query = { userId, book, chapter };
  if (completed) {
    const doc = { ...query, completedAt: /* @__PURE__ */ new Date() };
    if (database) {
      await database.collection("progress").updateOne(
        query,
        { $set: doc },
        { upsert: true }
      );
    } else {
      const existingIdx = fallbackDb.progress.findIndex((p) => p.userId === userId && p.book === book && p.chapter === chapter);
      if (existingIdx >= 0) {
        fallbackDb.progress[existingIdx] = doc;
      } else {
        fallbackDb.progress.push(doc);
      }
    }
  } else {
    if (database) {
      await database.collection("progress").deleteOne(query);
    } else {
      fallbackDb.progress = fallbackDb.progress.filter((p) => !(p.userId === userId && p.book === book && p.chapter === chapter));
    }
  }
}
async function syncUserData(userId, data) {
  const database = await getDb();
  if (!database) {
    return data;
  }
  const userHighlightsCol = database.collection("highlights");
  if (data.highlights && data.highlights.length > 0) {
    for (const h of data.highlights) {
      const q = { userId, id: h.id };
      await userHighlightsCol.updateOne(q, { $set: { userId, ...h } }, { upsert: true });
    }
  }
  const dbHighlights = await userHighlightsCol.find({ userId }).toArray();
  const userBookmarksCol = database.collection("bookmarks");
  if (data.bookmarks && data.bookmarks.length > 0) {
    for (const b of data.bookmarks) {
      const q = { userId, id: b.id };
      await userBookmarksCol.updateOne(q, { $set: { userId, ...b } }, { upsert: true });
    }
  }
  const dbBookmarks = await userBookmarksCol.find({ userId }).toArray();
  const userNotesCol = database.collection("notes");
  if (data.notes && data.notes.length > 0) {
    for (const n of data.notes) {
      const q = { userId, id: n.id };
      await userNotesCol.updateOne(q, { $set: { userId, ...n } }, { upsert: true });
    }
  }
  const dbNotes = await userNotesCol.find({ userId }).toArray();
  const userProgressCol = database.collection("progress");
  if (data.progress && data.progress.length > 0) {
    for (const p of data.progress) {
      const q = { userId, book: p.book, chapter: p.chapter };
      await userProgressCol.updateOne(q, { $set: { userId, ...p } }, { upsert: true });
    }
  }
  const dbProgress = await userProgressCol.find({ userId }).toArray();
  return {
    highlights: dbHighlights.map(({ _id, userId: userId2, ...rest }) => rest),
    bookmarks: dbBookmarks.map(({ _id, userId: userId2, ...rest }) => rest),
    notes: dbNotes.map(({ _id, userId: userId2, ...rest }) => rest),
    progress: dbProgress.map(({ _id, userId: userId2, ...rest }) => rest)
  };
}

// src/data/dailyContent.ts
var DAILY_VERSES = [
  {
    reference: "Philippians 4:7",
    book: "Philippians",
    chapter: 4,
    verseNum: 7,
    text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    translation: "NIV"
  },
  {
    reference: "Philippians 4:13",
    book: "Philippians",
    chapter: 4,
    verseNum: 13,
    text: "I can do all things through Christ which strengtheneth me.",
    translation: "KJV"
  },
  {
    reference: "Proverbs 3:5-6",
    book: "Proverbs",
    chapter: 3,
    verseNum: 5,
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    translation: "KJV"
  },
  {
    reference: "Isaiah 41:10",
    book: "Isaiah",
    chapter: 41,
    verseNum: 10,
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
    translation: "KJV"
  },
  {
    reference: "Romans 8:28",
    book: "Romans",
    chapter: 8,
    verseNum: 28,
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    translation: "KJV"
  },
  {
    reference: "Joshua 1:9",
    book: "Joshua",
    chapter: 1,
    verseNum: 9,
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
    translation: "KJV"
  },
  {
    reference: "Psalm 23:1",
    book: "Psalms",
    chapter: 23,
    verseNum: 1,
    text: "The LORD is my shepherd; I shall not want.",
    translation: "KJV"
  },
  {
    reference: "Hebrews 11:1",
    book: "Hebrews",
    chapter: 11,
    verseNum: 1,
    text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    translation: "KJV"
  },
  {
    reference: "John 14:6",
    book: "John",
    chapter: 14,
    verseNum: 6,
    text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
    translation: "KJV"
  },
  {
    reference: "Matthew 6:33",
    book: "Matthew",
    chapter: 6,
    verseNum: 33,
    text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    translation: "KJV"
  }
];

// server.ts
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    try {
      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hash = import_crypto.default.createHash("sha256").update(password).digest("hex");
      const user = await createUser({ email, passwordHash: hash, name });
      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to sign up", details: e.message });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
      const hash = import_crypto.default.createHash("sha256").update(password).digest("hex");
      if (user.passwordHash !== hash) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to login", details: e.message });
    }
  });
  app.post("/api/user/sync", async (req, res) => {
    const { userId, highlights, bookmarks, notes, progress } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    try {
      const synced = await syncUserData(userId, { highlights, bookmarks, notes, progress });
      res.json(synced);
    } catch (e) {
      res.status(500).json({ error: "Failed to sync data", details: e.message });
    }
  });
  app.post("/api/progress/toggle", async (req, res) => {
    const { userId, book, chapter, completed } = req.body;
    if (!userId || !book || !chapter) {
      return res.status(400).json({ error: "User ID, book, and chapter are required" });
    }
    try {
      await saveReadingProgress(userId, book, parseInt(chapter, 10), completed);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update progress", details: e.message });
    }
  });
  app.get("/api/daily-verse", async (req, res) => {
    const tz = req.query.tz || "UTC";
    let dateStr = "";
    try {
      dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { timeZone: tz });
    } catch {
      dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { timeZone: "UTC" });
    }
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % DAILY_VERSES.length;
    const selected = DAILY_VERSES[idx];
    res.json({
      date: dateStr,
      verse: selected
    });
  });
  const passageCache = {};
  const CACHE_TTL = 1e3 * 60 * 60 * 24;
  app.get("/api/passage", async (req, res) => {
    const { book, chapter, version } = req.query;
    if (!book || !chapter || !version) {
      return res.status(400).json({ error: "Missing book, chapter, or version parameter" });
    }
    const cacheKey = `${book}_${chapter}_${version}`.toLowerCase();
    const now = Date.now();
    if (passageCache[cacheKey] && now - passageCache[cacheKey].timestamp < CACHE_TTL) {
      return res.json(passageCache[cacheKey].data);
    }
    const searchStr = `${book} ${chapter}`;
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(searchStr)}&version=${encodeURIComponent(version)}`;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
      });
      if (!response.ok) {
        throw new Error(`Bible Gateway returned status ${response.status}`);
      }
      const html = await response.text();
      const { load } = await import("cheerio");
      const $ = load(html);
      const versesList = [];
      const versesMap = {};
      const passageContainers = $(".passage-text");
      if (passageContainers.length === 0) {
        console.log("No .passage-text container found, looking for span.text directly.");
      }
      $("span.text").each((_, el) => {
        const $span = $(el);
        const className = $span.attr("class") || "";
        const $clone = $span.clone();
        $clone.find(".footnote, .footnotes, .crossreference, .crossrefs, .chapternum, .versenum, sup").remove();
        let verseText = $clone.text().replace(/\s+/g, " ").trim();
        if (!verseText) return;
        let verseNum = null;
        const classes = className.split(/\s+/);
        for (const cls of classes) {
          const match = cls.match(/([\w\d_]+)-(\d+)-(\d+)/);
          if (match) {
            verseNum = parseInt(match[3], 10);
            break;
          }
        }
        if (verseNum === null) {
          const supText = $span.find("sup.versenum").text().trim();
          const parsed = parseInt(supText, 10);
          if (!isNaN(parsed)) {
            verseNum = parsed;
          }
        }
        if (verseNum === null) {
          const sup = $span.find("sup").first().text().trim();
          const parsed = parseInt(sup, 10);
          if (!isNaN(parsed)) {
            verseNum = parsed;
          }
        }
        if (verseNum !== null && !isNaN(verseNum)) {
          verseText = verseText.replace(/^[«»"'\s\-\[\]\(\)]+/, "").replace(/[«»"'\s\-\[\]\(\)]+$/, "").trim();
          if (versesMap[verseNum]) {
            versesMap[verseNum] += " " + verseText;
          } else {
            versesMap[verseNum] = verseText;
          }
        }
      });
      Object.keys(versesMap).map(Number).sort((a, b) => a - b).forEach((num) => {
        versesList.push({
          number: num,
          text: versesMap[num].replace(/\s+/g, " ").trim()
        });
      });
      if (versesList.length === 0) {
        console.log("No structured verses matched classes, attempting generic paragraph parsing.");
        $(".passage-text p").each((pIdx, pEl) => {
          const $p = $(pEl);
          const rawPText = $p.text().replace(/\s+/g, " ").trim();
          if (rawPText) {
            const fragments = rawPText.split(/(\d+)/);
            let currentNum = 1;
            for (let i = 0; i < fragments.length; i++) {
              const frag = fragments[i].trim();
              if (!frag) continue;
              const num = parseInt(frag, 10);
              if (!isNaN(num) && num < 200) {
                currentNum = num;
              } else {
                if (versesMap[currentNum]) {
                  versesMap[currentNum] += " " + frag;
                } else {
                  versesMap[currentNum] = frag;
                }
              }
            }
          }
        });
        Object.keys(versesMap).map(Number).sort((a, b) => a - b).forEach((num) => {
          versesList.push({
            number: num,
            text: versesMap[num].replace(/\s+/g, " ").trim()
          });
        });
      }
      const fetchFromBibleApiFallback = async () => {
        let apiVersion = "web";
        const v = version.toLowerCase();
        if (v === "kjv") {
          apiVersion = "kjv";
        } else if (v === "bbe") {
          apiVersion = "bbe";
        }
        const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${apiVersion}`);
        if (!apiRes.ok) {
          throw new Error(`bible-api.com returned status ${apiRes.status}`);
        }
        const apiData = await apiRes.json();
        if (apiData && Array.isArray(apiData.verses) && apiData.verses.length > 0) {
          return apiData.verses.map((v2) => ({
            number: v2.verse,
            text: v2.text.trim()
          }));
        }
        throw new Error("No verses returned from bible-api.com");
      };
      if (versesList.length === 0) {
        console.log("Bible Gateway scraping returned 0 verses, trying bible-api.com fallback...");
        try {
          const fallbackVerses = await fetchFromBibleApiFallback();
          console.log(`Successfully retrieved ${fallbackVerses.length} verses from bible-api.com fallback.`);
          const responseData2 = {
            book,
            chapter: parseInt(chapter, 10),
            translation: version,
            verses: fallbackVerses,
            source: "bible-api-fallback"
          };
          passageCache[cacheKey] = {
            timestamp: now,
            data: responseData2
          };
          return res.json(responseData2);
        } catch (fbError) {
          console.error("Failed bible-api.com fallback fetch:", fbError.message);
          return res.status(404).json({
            error: "Could not extract passage verses. Please try another translation or book.",
            details: "Scraping returned zero verses, and API fallback failed."
          });
        }
      }
      const responseData = {
        book,
        chapter: parseInt(chapter, 10),
        translation: version,
        verses: versesList
      };
      passageCache[cacheKey] = {
        timestamp: now,
        data: responseData
      };
      return res.json(responseData);
    } catch (error) {
      console.error(`Error fetching passage from Bible Gateway:`, error.message, "Trying bible-api.com fallback...");
      try {
        let apiVersion = "web";
        const v = version.toLowerCase();
        if (v === "kjv") {
          apiVersion = "kjv";
        } else if (v === "bbe") {
          apiVersion = "bbe";
        }
        const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${apiVersion}`);
        if (!apiRes.ok) {
          throw new Error(`bible-api.com returned status ${apiRes.status}`);
        }
        const apiData = await apiRes.json();
        if (apiData && Array.isArray(apiData.verses) && apiData.verses.length > 0) {
          const fallbackVerses = apiData.verses.map((v2) => ({
            number: v2.verse,
            text: v2.text.trim()
          }));
          console.log(`Successfully retrieved ${fallbackVerses.length} verses from bible-api.com after Gateway exception.`);
          const responseData = {
            book,
            chapter: parseInt(chapter, 10),
            translation: version,
            verses: fallbackVerses,
            source: "bible-api-fallback"
          };
          passageCache[cacheKey] = {
            timestamp: now,
            data: responseData
          };
          return res.json(responseData);
        }
        throw new Error("No verses returned from bible-api.com");
      } catch (fbError) {
        console.error("Failed both Bible Gateway scraping and fallback API:", fbError.message);
        return res.status(500).json({
          error: "Failed to retrieve scriptures from both Bible Gateway and fallback API.",
          details: fbError.message
        });
      }
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IGWT Bible Backend] Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
