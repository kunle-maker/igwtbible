import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // In-memory cache for scripture passages to ensure ultra-fast retrieval and reduce rate limiting
  const passageCache: { [key: string]: { timestamp: number; data: any } } = {};
  const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

  // API endpoint for scripture retrieval from Bible Gateway
  app.get('/api/passage', async (req, res) => {
    const { book, chapter, version } = req.query;

    if (!book || !chapter || !version) {
      return res.status(400).json({ error: 'Missing book, chapter, or version parameter' });
    }

    const cacheKey = `${book}_${chapter}_${version}`.toLowerCase();
    const now = Date.now();

    if (passageCache[cacheKey] && now - passageCache[cacheKey].timestamp < CACHE_TTL) {
      return res.json(passageCache[cacheKey].data);
    }

    const searchStr = `${book} ${chapter}`;
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(searchStr)}&version=${encodeURIComponent(version as string)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`Bible Gateway returned status ${response.status}`);
      }

      const html = await response.text();
      const { load } = await import('cheerio');
      const $ = load(html);

      const versesList: { number: number; text: string }[] = [];
      const versesMap: { [key: number]: string } = {};

      // In Bible Gateway, scripture lines are contained inside 'span.text' elements
      const passageContainers = $('.passage-text');
      if (passageContainers.length === 0) {
        // If there's no passage-text container, let's try looking inside the body or a generic container
        console.log('No .passage-text container found, looking for span.text directly.');
      }

      $('span.text').each((_, el) => {
        const $span = $(el);
        const className = $span.attr('class') || '';

        // Clone to clean and extract text
        const $clone = $span.clone();

        // Check if this span contains footnote indicators or cross-references
        $clone.find('.footnote, .footnotes, .crossreference, .crossrefs, .chapternum, .versenum, sup').remove();

        // Get the pure scripture text
        let verseText = $clone.text().replace(/\s+/g, ' ').trim();
        if (!verseText) return;

        // Try to determine the verse number from the class name (e.g., text Gen-1-1)
        let verseNum: number | null = null;
        const classes = className.split(/\s+/);
        for (const cls of classes) {
          const match = cls.match(/([\w\d_]+)-(\d+)-(\d+)/);
          if (match) {
            verseNum = parseInt(match[3], 10);
            break;
          }
        }

        // Fallback: If not found in class, check if original span has a sup.versenum inside
        if (verseNum === null) {
          const supText = $span.find('sup.versenum').text().trim();
          const parsed = parseInt(supText, 10);
          if (!isNaN(parsed)) {
            verseNum = parsed;
          }
        }

        // Extra Fallback: Check if there's any superscript text inside
        if (verseNum === null) {
          const sup = $span.find('sup').first().text().trim();
          const parsed = parseInt(sup, 10);
          if (!isNaN(parsed)) {
            verseNum = parsed;
          }
        }

        if (verseNum !== null && !isNaN(verseNum)) {
          // Clean the verse text further (remove leading/trailing symbols)
          verseText = verseText.replace(/^[«»"'\s\-\[\]\(\)]+/, '').replace(/[«»"'\s\-\[\]\(\)]+$/, '').trim();
          if (versesMap[verseNum]) {
            versesMap[verseNum] += ' ' + verseText;
          } else {
            versesMap[verseNum] = verseText;
          }
        }
      });

      // Construct a list of verses sorted by number
      Object.keys(versesMap)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((num) => {
          versesList.push({
            number: num,
            text: versesMap[num].replace(/\s+/g, ' ').trim()
          });
        });

      // If no verses were extracted, but we got HTML, let's see if we can perform a simple paragraph parsing
      if (versesList.length === 0) {
        console.log('No structured verses matched classes, attempting generic paragraph parsing.');
        // Fallback generic parsing: Extract text from paragraph tags in .passage-text
        $('.passage-text p').each((pIdx, pEl) => {
          const $p = $(pEl);
          const rawPText = $p.text().replace(/\s+/g, ' ').trim();
          if (rawPText) {
            // Split by numbers
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
                  versesMap[currentNum] += ' ' + frag;
                } else {
                  versesMap[currentNum] = frag;
                }
              }
            }
          }
        });

        Object.keys(versesMap)
          .map(Number)
          .sort((a, b) => a - b)
          .forEach((num) => {
            versesList.push({
              number: num,
              text: versesMap[num].replace(/\s+/g, ' ').trim()
            });
          });
      }

      // Helper to fetch from bible-api.com as robust fallback
      const fetchFromBibleApiFallback = async (): Promise<{ number: number; text: string }[]> => {
        let apiVersion = 'web';
        const v = (version as string).toLowerCase();
        if (v === 'kjv') {
          apiVersion = 'kjv';
        } else if (v === 'bbe') {
          apiVersion = 'bbe';
        }
        
        const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(book as string)}+${chapter}?translation=${apiVersion}`);
        if (!apiRes.ok) {
          throw new Error(`bible-api.com returned status ${apiRes.status}`);
        }
        const apiData = await apiRes.json();
        if (apiData && Array.isArray(apiData.verses) && apiData.verses.length > 0) {
          return apiData.verses.map((v: any) => ({
            number: v.verse,
            text: v.text.trim()
          }));
        }
        throw new Error('No verses returned from bible-api.com');
      };

      if (versesList.length === 0) {
        console.log('Bible Gateway scraping returned 0 verses, trying bible-api.com fallback...');
        try {
          const fallbackVerses = await fetchFromBibleApiFallback();
          console.log(`Successfully retrieved ${fallbackVerses.length} verses from bible-api.com fallback.`);
          const responseData = {
            book,
            chapter: parseInt(chapter as string, 10),
            translation: version,
            verses: fallbackVerses,
            source: 'bible-api-fallback'
          };

          passageCache[cacheKey] = {
            timestamp: now,
            data: responseData
          };

          return res.json(responseData);
        } catch (fbError: any) {
          console.error('Failed bible-api.com fallback fetch:', fbError.message);
          return res.status(404).json({
            error: 'Could not extract passage verses. Please try another translation or book.',
            details: 'Scraping returned zero verses, and API fallback failed.'
          });
        }
      }

      const responseData = {
        book,
        chapter: parseInt(chapter as string, 10),
        translation: version,
        verses: versesList
      };

      // Cache successful response
      passageCache[cacheKey] = {
        timestamp: now,
        data: responseData
      };

      return res.json(responseData);
    } catch (error: any) {
      console.error(`Error fetching passage from Bible Gateway:`, error.message, 'Trying bible-api.com fallback...');
      try {
        // Direct API fallback when connection/request to Bible Gateway fails
        let apiVersion = 'web';
        const v = (version as string).toLowerCase();
        if (v === 'kjv') {
          apiVersion = 'kjv';
        } else if (v === 'bbe') {
          apiVersion = 'bbe';
        }

        const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(book as string)}+${chapter}?translation=${apiVersion}`);
        if (!apiRes.ok) {
          throw new Error(`bible-api.com returned status ${apiRes.status}`);
        }
        const apiData = await apiRes.json();
        if (apiData && Array.isArray(apiData.verses) && apiData.verses.length > 0) {
          const fallbackVerses = apiData.verses.map((v: any) => ({
            number: v.verse,
            text: v.text.trim()
          }));

          console.log(`Successfully retrieved ${fallbackVerses.length} verses from bible-api.com after Gateway exception.`);
          const responseData = {
            book,
            chapter: parseInt(chapter as string, 10),
            translation: version,
            verses: fallbackVerses,
            source: 'bible-api-fallback'
          };

          passageCache[cacheKey] = {
            timestamp: now,
            data: responseData
          };

          return res.json(responseData);
        }
        throw new Error('No verses returned from bible-api.com');
      } catch (fbError: any) {
        console.error('Failed both Bible Gateway scraping and fallback API:', fbError.message);
        return res.status(500).json({
          error: 'Failed to retrieve scriptures from both Bible Gateway and fallback API.',
          details: fbError.message
        });
      }
    }
  });

  // Vite middleware setup for assets and SPA router integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IGWT Bible Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
