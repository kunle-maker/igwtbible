import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

// Simple in-memory cache at serverless instance level (best-effort)
const passageCache: { [key: string]: { timestamp: number; data: any } } = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
    const book = parsedUrl.searchParams.get('book');
    const chapter = parsedUrl.searchParams.get('chapter');
    const version = parsedUrl.searchParams.get('version');

    if (!book || !chapter || !version) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing book, chapter, or version parameter' }));
      return;
    }

    const cacheKey = `${book}_${chapter}_${version}`.toLowerCase();
    const now = Date.now();

    if (passageCache[cacheKey] && now - passageCache[cacheKey].timestamp < CACHE_TTL) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(passageCache[cacheKey].data));
      return;
    }

    const searchStr = `${book} ${chapter}`;
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(searchStr)}&version=${encodeURIComponent(version)}`;

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

    $('span.text').each((_, el) => {
      const $span = $(el);
      const className = $span.attr('class') || '';
      const $clone = $span.clone();

      $clone.find('.footnote, .footnotes, .crossreference, .crossrefs, .chapternum, .versenum, sup').remove();

      let verseText = $clone.text().replace(/\s+/g, ' ').trim();
      if (!verseText) return;

      let verseNum: number | null = null;
      const classes = className.split(/\s+/);
      for (const cls of classes) {
        const match = cls.match(/([\w\d_]+)-(\d+)-(\d+)/);
        if (match) {
          verseNum = parseInt(match[3], 10);
          break;
        }
      }

      if (verseNum === null) {
        const supText = $span.find('sup.versenum').text().trim();
        const parsed = parseInt(supText, 10);
        if (!isNaN(parsed)) {
          verseNum = parsed;
        }
      }

      if (verseNum === null) {
        const sup = $span.find('sup').first().text().trim();
        const parsed = parseInt(sup, 10);
        if (!isNaN(parsed)) {
          verseNum = parsed;
        }
      }

      if (verseNum !== null && !isNaN(verseNum)) {
        verseText = verseText.replace(/^[«»"'\s\-\[\]\(\)]+/, '').replace(/[«»"'\s\-\[\]\(\)]+$/, '').trim();
        if (versesMap[verseNum]) {
          versesMap[verseNum] += ' ' + verseText;
        } else {
          versesMap[verseNum] = verseText;
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

    if (versesList.length === 0) {
      $('.passage-text p').each((pIdx, pEl) => {
        const $p = $(pEl);
        const rawPText = $p.text().replace(/\s+/g, ' ').trim();
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

    const fetchFromBibleApiFallback = async (): Promise<{ number: number; text: string }[]> => {
      let apiVersion = 'web';
      const v = version.toLowerCase();
      if (v === 'kjv') {
        apiVersion = 'kjv';
      } else if (v === 'bbe') {
        apiVersion = 'bbe';
      }
      
      const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${apiVersion}`);
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
      try {
        const fallbackVerses = await fetchFromBibleApiFallback();
        const responseData = {
          book,
          chapter: parseInt(chapter, 10),
          translation: version,
          verses: fallbackVerses,
          source: 'bible-api-fallback'
        };

        passageCache[cacheKey] = {
          timestamp: now,
          data: responseData
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseData));
        return;
      } catch (fbError: any) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Could not extract passage verses. Please try another translation or book.',
          details: 'Scraping returned zero verses, and API fallback failed.'
        }));
        return;
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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(responseData));
  } catch (error: any) {
    try {
      const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
      const book = parsedUrl.searchParams.get('book') || '';
      const chapter = parsedUrl.searchParams.get('chapter') || '';
      const version = parsedUrl.searchParams.get('version') || '';

      let apiVersion = 'web';
      const v = version.toLowerCase();
      if (v === 'kjv') {
        apiVersion = 'kjv';
      } else if (v === 'bbe') {
        apiVersion = 'bbe';
      }

      const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${apiVersion}`);
      if (!apiRes.ok) {
        throw new Error(`bible-api.com returned status ${apiRes.status}`);
      }
      const apiData = await apiRes.json();
      if (apiData && Array.isArray(apiData.verses) && apiData.verses.length > 0) {
        const fallbackVerses = apiData.verses.map((v: any) => ({
          number: v.verse,
          text: v.text.trim()
        }));

        const responseData = {
          book,
          chapter: parseInt(chapter, 10),
          translation: version,
          verses: fallbackVerses,
          source: 'bible-api-fallback'
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseData));
        return;
      }
      throw new Error('No verses returned from bible-api.com');
    } catch (fbError: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Failed to retrieve scriptures from both Bible Gateway and fallback API.',
        details: fbError.message
      }));
    }
  }
}
