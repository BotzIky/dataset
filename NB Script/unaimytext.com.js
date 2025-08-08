import axios from 'axios';

const unaiMytext = {
  api: {
    base: 'https://unaimytext.com',
    endpoints: {
      humanize: '/api/humanize'
    }
  },

  headers: {
    'authority': 'unaimytext.com',
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://unaimytext.com',
    'referer': 'https://unaimytext.com/',
    'user-agent': 'Postify/1.0.0'
  },

  humanize: async (codes, level = "enhanced", settings = {}) => {
    if (typeof codes !== 'string' || !codes.trim()) {
      return { 
        success: false, 
        code: 400, 
        result: { 
          error: "Inputnya kudu diisi bree, kagak boleh kosong begitu.. 🗿",
        } 
      };
    }

    const isLevel = ["standard", "enhanced", "aggressive"];
    level = level.toLowerCase();
    if (!isLevel.includes(level)) {
      return {
        success: false,
        code: 400,
        result: {
          error: `Level ${level} kagak valid bree 🗿`,
          isLevel
        }
      };
    }

    try {
      const def = {
        removeUnicode: true,
        dashesToCommas: true,
        removeDashes: true,
        transformQuotes: true,
        removeWhitespace: true,
        removeEmDash: true,
        keyboardOnly: true
      };

      const response = await axios.post(
        `${unaiMytext.api.base}${unaiMytext.api.endpoints.humanize}`,
        {
          text: codes,
          recaptchaToken: "",
          level,
          settings: {
            ...def,
            ...settings
          }
        },
        { 
          headers: unaiMytext.headers,
          timeout: 10000
        }
      );

      if (!response.data?.text) {
        return {
          success: false,
          code: 500,
          result: {
            error: "Responsenya kosong bree 😂",
          }
        };
      }

      return {
        success: true,
        code: 200,
        level: level,
        result: {
          code: response.data.text,
          originalLength: codes.length,
          transformedLength: response.data.text.length,
          reductionPercentage: ((codes.length - response.data.text.length) / codes.length * 100).toFixed(2) + '%'
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: {
          error: "Error bree 😂"
        }
      };
    }
  }
};

export { unaiMytext };