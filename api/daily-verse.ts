import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { DAILY_VERSES } from '../src/data/dailyContent';

export default async function handler(req: any, res: any) {
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
    const tz = parsedUrl.searchParams.get('tz') || 'UTC';
    
    let dateStr = '';
    try {
      dateStr = new Date().toLocaleDateString('en-US', { timeZone: tz });
    } catch {
      dateStr = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' });
    }
    
    // Hash date string to produce a deterministic index
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % DAILY_VERSES.length;
    const selected = DAILY_VERSES[idx];
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      date: dateStr,
      verse: selected
    }));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to retrieve daily verse', details: e.message }));
  }
}
