import axios from 'axios';

const luban = {
  api: {
    base: 'https://lubansms.com',
    endpoints: {
      freeCountries: (lang = 'en') =>
        `/v2/api/freeCountries?language=${lang}`,
      freeNumbers: (countryName = 'russia') =>
        `/v2/api/freeNumbers?countries=${countryName}`,
      freeMessages: (countryName, number) =>
        `/v2/api/freeMessage?countries=${countryName}&number=${number}`
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0',
    'accept-encoding': 'gzip',
    system: 'Android',
    time: `${Date.now()}`,
    type: '2'
  },

  request: async (countryName = '') => {
    if (typeof countryName !== 'string' || !countryName.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Negaranya mana bree? Aelah 🗿' }
      };
    }

    const url = `${luban.api.base}${luban.api.endpoints.freeNumbers(countryName)}`;

    try {
      const { data } = await axios.get(url, {
        headers: luban.headers,
        timeout: 15000
      });

      if (!data || data.code !== 0 || !Array.isArray(data.msg)) {
        return {
          success: false,
          code: 500,
          result: { error: `Data nokos ${countryName} kagak valid bree.. cari yang lain aja dah 😂` }
        };
      }

      const active = data.msg
        .filter(n => !n.is_archive)
        .map(n => ({
          full: n.full_number.toString(),
          short: n.number.toString(),
          code: n.code,
          country: n.country,
          age: n.data_humans
        }));

      return {
        success: true,
        code: 200,
        result: {
          total: active.length,
          numbers: active,
          created: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: 'Error bree 🤙🏻😏' }
      };
    }
  },

  checkMessages: async (countryName = '', number = '') => {
    if (typeof countryName !== 'string' || !countryName.trim() ||
        typeof number !== 'string' || !number.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Negara ama Nokosnya kagak boleh kosong.. input ulang.. ' }
      };
    }

    number = number.replace(/\D/g, '');

    const url = `${luban.api.base}${luban.api.endpoints.freeMessages(countryName, number)}`;

    try {
      const { data } = await axios.get(url, {
        headers: luban.headers,
        timeout: 15000
      });

      if (!data || typeof data !== 'object' || data.code !== 0 || !('msg' in data)) {
        return {
          success: false,
          code: 500,
          result: { error: 'Data pesannya kagak valid bree, coba lagi nanti aja yak :v' }
        };
      }

      const i = Array.isArray(data.msg) ? data.msg : [];

      const messages = i.map(m => ({
        id: m.id,
        from: m.in_number || m.innumber || '',
        to: m.my_number,
        text: m.text,
        code: m.code !== '-' ? m.code : null,
        received: m.created_at,
        age: m.data_humans
      }));

      return {
        success: true,
        code: 200,
        result: {
          total: messages.length,
          messages,
          created: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: error.message || 'Yaaakk... error bree 🤙🏻😏' }
      };
    }
  },

  generate: async (countryName = '') => {
    if (typeof countryName !== 'string' || !countryName.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Negaranya kagak boleh bree.. Input ulang kagak lu 🫵🏻' }
      };
    }

    try {
      const i = await axios.get(
        `${luban.api.base}${luban.api.endpoints.freeCountries()}`,
        {
          headers: luban.headers,
          timeout: 15000
        }
      );

      if (!i.data || i.data.code !== 0) {
        return {
          success: false,
          code: 500,
          result: { error: 'Daftar negaranya kagak bisa diambil bree, coba nanti lagi aja yak 🤙🏻😏' }
        };
      }

      const target = i.data.msg.find(
        c => c.name.toLowerCase() === countryName.toLowerCase()
      );

      if (!target) {
        return {
          success: false,
          code: 404,
          result: { error: `Negara ${countryName} mah kagak ada bree.. Cari yang lain aja dah.. ` }
        };
      }

      if (!target.online) {
        return {
          success: false,
          code: 403,
          result: { error: `Negara ${countryName} offline 🚫` }
        };
      }

      const res = await luban.request(countryName);
      if (!res.success) return res;

      const countByCountry = {
        [target.locale]: res.result.total
      };

      const sorted = res.result.numbers.sort((a, b) => {
        const ageA = atom(a.age);
        const ageB = atom(b.age);
        return ageA - ageB;
      });

      return {
        success: true,
        code: 200,
        result: {
          total: sorted.length,
          numbers: sorted.map(n => ({
            ...n,
            countryName: target.locale
          })),
          countByCountry,
          created: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: 'Beuhh... error bree 🤙🏻😏' }
      };
    }
  }
};

function atom(text) {
  const map = {
    minute: 1,
    minutes: 1,
    hour: 60,
    hours: 60,
    day: 1440,
    days: 1440,
    week: 10080,
    weeks: 10080
  };

  const [value, unit] = text.split(' ');
  return parseInt(value) * (map[unit] || 999999);
}

export { luban };
