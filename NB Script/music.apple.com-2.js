const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://music.apple.com/id/search?term=';

/**
 * Scrape Apple Music search results for a given term.
 * @param {string} term — kata kunci pencarian, misal "sempurna"
 * @returns {Promise<Array<{ title: string, subtitle: string, link: string, image: string|null }>>}
 */
async function searchAppleMusic(term) {
  const url = `${BASE_URL}${encodeURIComponent(term)}`;

  try {
    // 1. Fetch halaman
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    // 2. Parse dengan Cheerio
    const $ = cheerio.load(html);
    const results = [];

    // 3. Ekstrak tiap item grid
    $('li.grid-item').each((_, li) => {
      const el = $(li);

      const link = el.find('a.click-action').attr('href');
      const title = el
        .find('[data-testid="top-search-result-title"] .top-search-lockup__primary__title')
        .text()
        .trim();
      const subtitle = el
        .find('[data-testid="top-search-result-subtitle"]')
        .text()
        .trim();
      // ambil srcset pertama dari <source type="image/jpeg">
      const imgSrc = el
        .find('picture source[type="image/jpeg"]')
        .first()
        .attr('srcset')
        ?.split(' ')[0] || null;

      if (title && link) {
        results.push({ title, subtitle, link, image: imgSrc });
      }
    });

    return results;
  } catch (err) {
    console.error(`Error scraping "${term}":`, err.message);
    return [];
  }
}

// Contohnya
return searchAppleMusic('sempurna')