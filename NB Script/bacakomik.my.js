import axios from 'axios';

const bacaKomik = {
  api: {
    base: 'https://omikbkversialter.click',
    endpoints: {
      search: (keyword, paged = 1) => `page=search&search=${encodeURIComponent(keyword)}&paged=${paged}`,
      latest: () => 'page=latest',
      rekomendasi: () => 'page=rekomendasi',
      filter: params => {
        const query = new URLSearchParams();
        query.set('page', 'filter');
        if (params.type) query.set('type', params.type);
        if (params.status) query.set('status', params.status);
        (params.genre || []).forEach(g => query.append('genre[]', g));
        (params.content || []).forEach(c => query.append('content[]', c));
        (params.demographic || []).forEach(d => query.append('demographic[]', d));
        (params.theme || []).forEach(t => query.append('theme[]', t));
        return query.toString();
      },
      detail: id => `page=manga&id=${id}`,
      chapter: id => `page=chapter&id=${id}`
    }
  },

  headers: {
    'user-agent': 'Postify/1.0.0',
    Connection: 'Keep-Alive',
    'accept-encoding': 'gzip'
  },

  parse: url => {
    try {
      const full = new URL(url);
      const params = new URLSearchParams(full.search);
      const page = params.get('page');
      const id = params.get('id');
      return (page && id) ? { page, id } : null;
    } catch {
      return null;
    }
  },

  search: async (keyword = 'Love', paged = 1) => {
    if (typeof keyword !== 'string' || !keyword.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Keywordnya kudu diisi bree.. lu nyari apaan kosong begitu 🗿' }
      };
    }

    if (!Number.isInteger(paged) || paged < 1) {
      return {
        success: false,
        code: 400,
        result: { error: `Pages kudu angka yak, apaan2 lu input ${paged} 😂` }
      };
    }

    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.search(keyword, paged)}`;

    try {
      const response = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 8000,
        validateStatus: status => status >= 200 && status < 500
      });

      if (response.status === 404) {
        return {
          success: false,
          code: 404,
          result: { error: `Page ke-${paged} kagak ada bree... 🙈` }
        };
      }

      if (!Array.isArray(response.data) || response.data.length === 0) {
        return {
          success: false,
          code: 204,
          result: { error: `Page ke-${paged} kosong bree, kagak ada hasilnya :v` }
        };
      }

      const result = response.data.map(item => ({
        title: item.title || '',
        url: item.url || '',
        image: item.img || '',
        type: item.type || '',
        score: parseFloat(item.score) || 0,
        genres: Array.isArray(item.genre) ? item.genre : [],
        chapter: item.chapter || ''
      }));

      return {
        success: true,
        code: response.status,
        result: {
          query: keyword,
          paged,
          total: result.length,
          data: result
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Pencariannya kagak bisa dilanjutin bree, error 😂' }
      };
    }
  },

  latest: async () => {
    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.latest()}`;

    try {
      const response = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 8000,
        validateStatus: status => status >= 200 && status < 500
      });

      if (!Array.isArray(response.data)) {
        return {
          success: false,
          code: response.status,
          result: { error: 'Hah? Kosong!! 😂' }
        };
      }

      const result = response.data.map(item => ({
        title: item.title || '',
        url: item.url || '',
        image: item.img || '',
        type: item.type || '',
        views: item.views || 0,
        score: parseFloat(item.score) || 0,
        status: item.status || '',
        colorized: item.colorized === '1',
        latestChapter: {
          chapter: item.data?.chapter || '',
          url: item.data?.url || '',
          time: item.data?.time || ''
        }
      }));

      return {
        success: true,
        code: response.status,
        result: {
          total: result.length,
          data: result
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Yaelah, kagak bisa data komik terbarunya bree...' }
      };
    }
  },

  rekomendasi: async () => {
    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.rekomendasi()}`;

    try {
      const response = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 8000,
        validateStatus: status => status >= 200 && status < 500
      });

      if (!Array.isArray(response.data)) {
        return {
          success: false,
          code: response.status,
          result: { error: 'Kagak ada komik yang direkomendasikan bree ✌🏻' }
        };
      }

      const result = response.data.map(item => ({
        title: item.title || '',
        url: item.url || '',
        image: item.img || '',
        type: item.type || '',
        score: parseFloat(item.score) || 0,
        status: item.status || '',
        recommendedChapter: {
          chapter: item.data?.chapter || '',
          url: item.data?.url || '',
          time: item.data?.time || ''
        }
      }));

      return {
        success: true,
        code: response.status,
        result: {
          total: result.length,
          data: result
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Kagak ada rekomendasi buat lu... 😂' }
      };
    }
  },

  filter: async (params = {}) => {
    const isValidArray = arr => Array.isArray(arr) && arr.every(v => typeof v === 'string' && v.trim());

    const { type = '', status = '', genre = [], content = [], demographic = [], theme = [] } = params;

    if (
      (type && typeof type !== 'string') ||
      (status && typeof status !== 'string') ||
      !isValidArray(genre) || !isValidArray(content) ||
      !isValidArray(demographic) || !isValidArray(theme)
    ) {
      return {
        success: false,
        code: 400,
        result: { error: 'Format input filternya salah bree..  Usahain semua parameternya valid yak bree 🖕🏻' }
      };
    }

    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.filter({ type, status, genre, content, demographic, theme })}`;

    try {
      const response = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 8000,
        validateStatus: status => status >= 200 && status < 500
      });

      if (!Array.isArray(response.data)) {
        return {
          success: false,
          code: response.status,
          result: { error: 'Filternya mana njirr? kudu diisi filternya 🖕🏻' }
        };
      }

      const result = response.data.map(item => ({
        title: item.title || '',
        url: item.url || '',
        image: item.img || '',
        type: item.type || '',
        score: parseFloat(item.score) || 0,
        genres: Array.isArray(item.genre) ? item.genre : [],
        chapter: item.chapter || ''
      }));

      return {
        success: true,
        code: response.status,
        result: {
          filters: params,
          total: result.length,
          data: result
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  },

  detail: async input => {
    const parsed = typeof input === 'string' ? bacaKomik.parse(input) : { page: 'manga', id: input };
    if (!parsed || parsed.page !== 'manga') {
      return { 
        success: false, 
        code: 400, 
        result: { error: 'Inputnya kudu URL yak bree, kek begini nih contohnya page=manga & id=82831 atau ID string langsung yak bree 😑' } 
      };
    }

    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.detail(parsed.id)}`;

    try {
      const res = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 10000,
        validateStatus: status => status >= 200 && status < 500
      });

      const data = res.data?.[0];
      if (!data) {
        return {
          success: false,
          code: 204,
          result: { error: 'Detail manga nya kagak ada bree... 🌚' }
        };
      }

      const result = {
        type: 'manga',
        id: parsed.id,
        title: data.title || '',
        synopsis: data.synopsis || '',
        score: parseFloat(data.score) || 0,
        status: data.status || '',
        cover: data.cover || '',
        thumbnail: data.img || '',
        author: Array.isArray(data.author) ? data.author.map(a => a.name || '') : [],
        genre: Array.isArray(data.genre) ? data.genre.map(g => g.name || '') : [],
        theme: Array.isArray(data.theme) ? data.theme.map(t => t.name || '') : [],
        content: Array.isArray(data.content) ? data.content.map(c => c.name || '') : [],
        demographic: Array.isArray(data.demographic) ? data.demographic.map(d => d.name || '') : [],
        chapters: Array.isArray(data.data) ? data.data.map(ch => ({
          chapter: ch.chapter || '',
          url: ch.url || '',
          download: ch.download || ''
        })) : []
      };

      return {
        success: true,
        code: res.status,
        result
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  },

  chapter: async input => {
    const parsed = typeof input === 'string' ? bacaKomik.parse(input) : { page: 'chapter', id: input };
    if (!parsed || parsed.page !== 'chapter') {
      return {
        success: false,
        code: 400,
        result: { error: 'Inputnya kudu URL yak bree, kek begini nih contohnya page=chapter & id=82834 atau ID string langsung yak bree 😑' }
      };
    }

    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.chapter(parsed.id)}`;

    try {
      const res = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 10000,
        validateStatus: status => status >= 200 && status < 500
      });

      const data = res.data;
      if (!data?.image?.length) {
        return {
          success: false,
          code: 204,
          result: { error: 'Chapternya kagak ada datanya bree 😂' }
        };
      }

      const result = {
        type: 'chapter',
        id: parsed.id,
        title: data.title || '',
        chapter: data.chapter || '',
        next: data.next || '',
        thumbnail: data.thumb || '',
        readerLink: data.link || '',
        adsLink: data.adsurl || '',
        images: Array.isArray(data.image) ? data.image : []
      };

      return {
        success: true,
        code: res.status,
        result
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  }
};

export { bacaKomik };