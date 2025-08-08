import axios from 'axios';
import * as cheerio from 'cheerio';

const kuroGrave = {
  api: {
    base: 'https://k.kurogaze.moe',
    endpoints: {
      search: (keyword, page = 1) =>
        `/page/${page}/?s=${encodeURIComponent(keyword)}&post_type=post`,
      jadwal: () => '/jadwal-rilis/',
      homepage: () => '/'
    }
  },

  headers: {
    'user-agent': 'Postify/1.0.0',
    accept: 'text/html',
    referer: 'https://k.kurogaze.moe/'
  },

  fetch: async (url) => {
    const { data } = await axios.get(url, { headers: kuroGrave.headers, timeout: 15000 });
    return cheerio.load(data);
  },

  details: async (url) => {
    if (!url) return {
      success: false,
      code: 400,
      result: { error: 'Link Kurgazenya mana njirr 🗿' }
    };

    try {
      const $ = await kuroGrave.fetch(url);
      const title = $('h1').text().trim();
      const sinopsis = $('.sinopsis .content').text().trim();
      const info = {};

      $('.single-data table tr').each((_, tr) => {
        const key = $(tr).find('td').first().text().trim().toLowerCase();
        const val = $(tr).find('td').last().text().trim();
        info[key] = val;
      });

      const trailer = $('.trailer iframe').attr('src') || null;
      const episodeList = $('.episode-data ul li').map((_, li) => $(li).text().trim()).get();
      const downloadLinks = [];

      $('.dlcontent .title-dl-anime').each((_, el) => {
        const episodeTitle = $(el).text().trim();
        const episodeNumber = episodeTitle.match(/Episode\s+(\d+)/i)?.[1] || null;

        $(el).next('.dl-content-for').find('.reso').each((_, r) => {
          const resolution = $(r).find('strong').text().trim();
          const mirrors = $(r).find('a').map((_, a) => ({
            label: $(a).text().trim(),
            link: $(a).attr('href')
          })).get();

          if (resolution && mirrors.length) {
            downloadLinks.push({ episode: episodeNumber, episodeTitle, resolution, mirrors });
          }
        });
      });

      if (!downloadLinks.length) {
        $('.content-batch ul li, .dl-content-for .reso').each((_, r) => {
          const resolution = $(r).find('strong').text().trim();
          const mirrors = $(r).find('a').map((_, a) => ({
            label: $(a).text().trim(),
            link: $(a).attr('href')
          })).get();

          if (resolution && mirrors.length) downloadLinks.push({ resolution, mirrors });
        });
      }

      const inferredType = info.type || (info.premiered || info.series ? 'TV' : 'Unknown');

      return {
        success: true,
        code: 200,
        result: {
          title,
          type: inferredType,
          synonym: info.synonym || '',
          sinopsis,
          premiered: info.premiered || '',
          status: info.status || '',
          score: info.score || '',
          duration: info.duration || '',
          studio: info.studios || '',
          epsTotal: info.episode || '',
          series: info.series || '',
          genre: info.genre || '',
          trailer,
          episodeList,
          downloadLinks
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err?.response?.status || 500,
        result: {
          error: 'Error bree 😂 kagak bisa ngambil data details Kurograve..',
          details: err.message
        }
      };
    }
  },

  search: async (keyword = '', page = 1) => {
    if (!keyword) {
      return {
        success: false,
        code: 400,
        result: { error: 'Keyword kagak boleh kosong bree .. Aelah 🗿 nyari apaan kosong begitu ..' }
      };
    }

    try {
      const $ = await kuroGrave.fetch(`${kuroGrave.api.base}${kuroGrave.api.endpoints.search(keyword, page)}`);
      const articles = $('.artikel-post article').toArray();

      if (!articles.length) {
        return {
          success: false,
          code: 404,
          result: { error: `Anime "${keyword}" kagak ada bree 🫵🏻😂` }
        };
      }

      const results = await Promise.all(articles.map(async el => {
        const wrap = $(el);
        const title = wrap.find('h2.title a').text().trim();
        const link = wrap.find('h2.title a').attr('href');
        const image = wrap.find('.thumb img').attr('src');
        const postedBy = wrap.find('td:contains("Posted By") + td.author strong').text().trim();
        const type = wrap.find('td:contains("Type") + td a').text().trim();
        const genres = wrap.find('td:contains("Genres") + td a').map((_, a) => $(a).text().trim()).get();
        const season = wrap.find('td:contains("Premiered") + td a').text().trim();
        const status = wrap.find('td:contains("Status") + td a').text().trim();
        const score = wrap.find('.score').text().trim();
        const dateInfo = wrap.find('.date').text().trim();
        const detail = type || season || wrap.find('td:contains("Series")').length
          ? (await kuroGrave.details(link)).result
          : null;

        return { title, link, image, postedBy, type, genres, season, status, score, dateInfo, detail };
      }));

      const pageNumbers = $('ul.pagination li')
        .map((_, li) => parseInt($(li).text().trim())).get().filter(Boolean);
      const totalPages = Math.max(...pageNumbers, page);
      const hasNextPage = $('ul.pagination li').filter((_, li) =>
        $(li).text().trim() === 'Next' && !$(li).hasClass('disabled')
      ).length > 0;

      return {
        success: true,
        code: 200,
        result: {
          keyword,
          page,
          totalResults: results.length,
          pagination: { currentPage: page, hasNextPage, totalPages },
          data: results
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err?.response?.status || 500,
        result: {
          error: 'Error bree 😂 kagak bisa ngambil data search Kurograve..',
          details: err.message
        }
      };
    }
  },

  schedule: async () => {
    try {
      const $ = await kuroGrave.fetch(`${kuroGrave.api.base}${kuroGrave.api.endpoints.jadwal()}`);
      const jadwal = {};

      $('.contnet-artikel h3').each((_, h) => {
        const hari = $(h).text().trim().toUpperCase();
        if (!['SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU'].includes(hari)) return;

        const list = [];
        $(h).next('p').find('a').each((_, a) => {
          const link = $(a).attr('href');
          const title = $(a).text().trim();
          const wr = $(a).parent().text().trim();
          const tm = wr.match(/\((.*?)\)/);
          const time = tm ? tm[1].replace(/–/g, '-') : null;
          list.push({ title, time, link });
        });

        jadwal[hari] = list;
      });

      return {
        success: true,
        code: 200,
        result: {
          source: `${kuroGrave.api.base}${kuroGrave.api.endpoints.jadwal()}`,
          updated: new Date().toISOString(),
          schedule: jadwal
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err?.response?.status || 500,
        result: {
          error: 'Error bree 😂 kagak bisa ngambil data schedule Kurograve..',
          details: err.message
        }
      };
    }
  },

  ongoing: async () => {
    try {
      const $ = await kuroGrave.fetch(`${kuroGrave.api.base}${kuroGrave.api.endpoints.homepage()}`);
      const list = [];

      $('.carousel-wrapp .owl-carousel .article.item').each((_, el) => {
        const wrap = $(el);
        list.push({
          title: wrap.find('h3').text().trim(),
          link: wrap.find('a').attr('href'),
          image: wrap.find('img').attr('src'),
          time: wrap.find('.waktu-carousel').text().trim(),
          episode: wrap.find('.eps-terbaru').text().trim()
        });
      });

      return {
        success: true,
        code: 200,
        result: {
          source: `${kuroGrave.api.base}${kuroGrave.api.endpoints.homepage()}`,
          updated: new Date().toISOString(),
          data: list
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err?.response?.status || 500,
        result: {
          error: 'Error bree 😂 kagak bisa ngambil data ongoing Kurograve..',
          details: err.message
        }
      };
    }
  }
};

export { kuroGrave };