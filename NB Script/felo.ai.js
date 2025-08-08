/**
 * ┌─「 Felo AI 」
 * ├ *Creator* : Fruatre Maou
 * ├ *Channel* : https://whatsapp.com/channel/0029VaNR2B6BadmioY6mar3N
 * ├  AI with Search Engine 
 * └─ wa.me/6285817597752 
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { JSDOM } = require('jsdom');

/** 
 * List of user agents to be randomly rotated for anti-blocking
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

/** 
 * In-memory cache to reduce repeated requests
 */
const resultsCache = new Map();

/** 
 * Cache duration: 5 minutes
 */
const CACHE_DURATION = 5 * 60 * 1000;

/** 
 * Generate a random User-Agent from list
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/** 
 * Create a cache key based on query
 * @param {string} query
 */
function getCacheKey(query) {
  return `felo-${query}`;
}

/** 
 * Clean up expired cache entries
 */
function clearOldCache() {
  const now = Date.now();
  for (const [key, value] of resultsCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      resultsCache.delete(key);
    }
  }
}

/** 
 * Extract direct link from DuckDuckGo redirect URL
 * @param {string} rawUrl
 */
function extractDirectUrl(rawUrl) {
  try {
    if (rawUrl.startsWith('//')) rawUrl = 'https:' + rawUrl;
    else if (rawUrl.startsWith('/')) rawUrl = 'https://duckduckgo.com' + rawUrl;

    const url = new URL(rawUrl);
    if (url.hostname === 'duckduckgo.com' && url.pathname === '/l/') {
      const real = url.searchParams.get('uddg');
      return real ? decodeURIComponent(real) : rawUrl;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

/** 
 * Scrape reference links from DuckDuckGo search result
 * @param {string} query
 * @param {number} maxResults
 */
async function getDuckDuckGoLinks(query, maxResults = 5) {
  try {
    const response = await axios.get(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': getRandomUserAgent() }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const results = [];

    const items = document.querySelectorAll('.result__title a');
    for (const item of items) {
      const title = item.textContent.trim();
      const rawUrl = item.getAttribute('href');
      const url = extractDirectUrl(rawUrl);
      if (title && url) {
        results.push(`- ${title} → ${url}`);
        if (results.length >= maxResults) break;
      }
    }
    return results;
  } catch {
    return [];
  }
}

/** 
 * Main Felo AI search function using streamed API
 * @param {string} prompt - the input question
 */
async function felosearch(prompt) {
  clearOldCache();
  const cacheKey = getCacheKey(prompt);
  const cached = resultsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }

  const payload = {
    query: prompt,
    search_uuid: uuidv4(),
    lang: '',
    agent_lang: 'en',
    search_options: { langcode: 'en-US' },
    search_video: true,
    contexts_from: 'google'
  };

  const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://felo.ai',
    'referer': 'https://felo.ai/',
    'user-agent': getRandomUserAgent()
  };

  try {
    const response = await axios.post('https://api.felo.ai/search/threads', payload, {
      headers,
      timeout: 30000,
      responseType: 'stream'
    });

    let resultText = '';
    for await (const chunk of response.data) {
      const lines = chunk.toString().split('\n').filter(l => l.startsWith('data:'));
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(5));
          if (data.type === 'answer' && data.data?.text) {
            resultText = data.data.text;
          }
        } catch {}
      }
    }

    /** 
     * Combine Felo result with DuckDuckGo reference links
     */
    const references = await getDuckDuckGoLinks(prompt);
    let fullResult = resultText || 'No response from Felo';
    if (references.length) {
      fullResult += '\n\n📚 Referensi:\n' + references.join('\n');
    }

    resultsCache.set(cacheKey, { results: fullResult, timestamp: Date.now() });
    return fullResult;
  } catch (err) {
    return `Felo error: ${err.message}`;
  }
}

/** 
 * Example usage
 */
return felosearch("apa itu JavaScript")

/**
* example result
* JavaScript adalah bahasa pemrograman yang sangat penting dalam pengembangan web, digunakan untuk menciptakan interaktivitas dan dinamika pada halaman web. Berikut adalah beberapa poin kunci mengenai JavaScript:
**Definisi dan Fungsi**  
JavaScript adalah bahasa pemrograman tingkat tinggi yang digunakan untuk membuat halaman web interaktif. Dengan JavaScript, pengembang dapat menambahkan elemen-elemen dinamis seperti animasi, pemrosesan data, dan interaksi pengguna, yang meningkatkan pengalaman pengguna di situs web[1][12][19].
**Sejarah**  
JavaScript diciptakan oleh Brendan Eich pada tahun 1995 untuk menambah interaktivitas pada halaman web. Sejak saat itu, JavaScript telah berkembang menjadi salah satu bahasa pemrograman paling populer di dunia, digunakan oleh banyak perusahaan besar seperti Google, Facebook, dan Amazon[2][11].
**Karakteristik**  
JavaScript adalah bahasa yang bersifat dinamis dan mendukung berbagai paradigma pemrograman, termasuk pemrograman berorientasi objek dan fungsional. Ini memungkinkan pengembang untuk membuat aplikasi yang kompleks dan responsif[3][5][14].
**Penggunaan**  
JavaScript digunakan dalam berbagai konteks, termasuk:
- **Pengembangan Web**: Menambahkan interaktivitas pada halaman web, seperti validasi formulir, animasi, dan pembaruan konten secara real-time tanpa perlu memuat ulang halaman[4][10].
  
- **Aplikasi Seluler**: Membantu dalam pengembangan antarmuka pengguna yang responsif dan interaktif untuk aplikasi seluler[2][12].
- **Pengembangan Game**: Banyak game berbasis web dibangun menggunakan JavaScript, memanfaatkan kemampuannya untuk mengelola grafik dan interaksi pengguna[4][10].
- **Server-Side Scripting**: Dengan munculnya lingkungan seperti Node.js, JavaScript juga digunakan untuk pengembangan sisi server, memungkinkan pengembang untuk menggunakan satu bahasa di seluruh tumpukan teknologi[3][10].
Secara keseluruhan, JavaScript adalah alat yang sangat kuat dan fleksibel yang memungkinkan pengembang untuk menciptakan pengalaman web yang menarik dan interaktif.
📚 Referensi:
- Apa itu Javascript? Pengertian, Fungsi & Bedanya dengan Java → https://www.dewaweb.com/blog/mengenal-javascript/
- Apa Itu JavaScript? Fungsi dan Contohnya - Dicoding Blog → https://www.dicoding.com/blog/apa-itu-javascript-fungsi-dan-contohnya/
- Apa Itu JavaScript? Definisi, Fungsi, Cara Kerja, dan Contoh → https://dibimbing.id/blog/detail/apa-itu-javascript-definisi-fungsi-cara-kerja-dan-contoh
- Apa Itu JavaScript? Pengertian dan Perbedaannya dengan Java → https://www.hostinger.com/id/tutorial/apa-itu-javascript
- Apa Itu JavaScript? Pengertian dan Kegunaannya → https://www.gudanginformatika.com/2025/02/apa-itu-javascript-pengertian-dan.html
*/