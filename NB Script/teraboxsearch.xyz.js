import axios from 'axios';

const teraboxSearch = {
  api: {
    base: 'https://teraboxsearch.xyz',
    endpoints: {
      search: '/api/search'
    }
  },

  headers: {
    'authority': 'teraboxsearch.xyz',
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://teraboxsearch.xyz',
    'referer': 'https://teraboxsearch.xyz/',
    'user-agent': 'Postify/1.0.0'
  },

  search: async (query, types = "both") => {
    if (typeof query !== 'string' || !query.trim()) {
      return { 
        success: false, 
        code: 400, 
        result: { 
          error: "Querynya mana bree? Jangan kosong begini dong.. aelah 🗿",
        } 
      };
    }

    const isType = ["groups", "content", "both"];
    if (!isType.includes(types)) {
      return {
        success: false,
        code: 400,
        result: {
          error: `Return type ${types} kagak valid bree 🗿`,
          isType
        }
      };
    }

    try {
      const randomId = Math.floor(Math.random() * 1e12);
      const timestamp = Math.floor(Date.now() / 1000);
      const cookies = `_ga=GA1.1.${randomId}.${timestamp}; _ga_3V4YVZ722G=GS2.1.${timestamp}$o1$g0$t${timestamp + 10}$j50$l0$h0`;

      const response = await axios.post(
        `${teraboxSearch.api.base}${teraboxSearch.api.endpoints.search}`,
        { query },
        { 
          headers: {
            ...teraboxSearch.headers,
            cookie: cookies
          },
          timeout: 10000
        }
      );

      if (!response.data?.data) {
        return {
          success: false,
          code: 500,
          result: {
            error: "Responsenya kosong bree 😂",
          }
        };
      }
      
      const result = {};
      const groups = response.data.data.groups || [];
      const contents = response.data.data.content || [];

      if (types === 'groups' || types === 'both') {
        result.groups = groups;
      }
      if (types === 'content' || types === 'both') {
        result.contents = contents;
      }

      return {
        success: true,
        code: 200,
        types: types,
        result: {
          ...result,
          totalResults: (types === 'both' ? groups.length + contents.length :
                       types === 'groups' ? groups.length :
                       contents.length)
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: {
          error: "Error bree 🤣"
        }
      };
    }
  }
};

export { teraboxSearch };