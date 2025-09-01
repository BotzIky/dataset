import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const ghibli = {
  api: {
    base: 'https://api.code12.cloud',
    endpoints: {
      paygate: (slug) => `/app/paygate-oauth${slug}`,
      ghibli: (slug) => `/app/v2/ghibli/user-image${slug}`,
    },
  },

  creds: {
    appId: 'DKTECH_GHIBLI_Dktechinc',
    secretKey: 'r0R5EKF4seRwqUIB8gLPdFvNmPm8rN63',
  },

  studios: [
    'ghibli-howl-moving-castle-anime',
    'ghibli-spirited-away-anime',
    'ghibli-my-neighbor-totoro-anime',
    'ghibli-ponyo-anime',
    'ghibli-grave-of-fireflies-anime',
    'ghibli-princess-mononoke-anime',
    'ghibli-kaguya-anime',
  ],

  headers: {
    'user-agent': 'NB Android/1.0.0',
    'accept-encoding': 'gzip',
  },

  db: './db.json',

  log: (...args) => console.log(...args),

  readDB: () => {
    try {
      return JSON.parse(fs.readFileSync(ghibli.db, 'utf-8'));
    } catch {
      return null;
    }
  },

  writeDB: (data) => fs.writeFileSync(ghibli.db, JSON.stringify(data, null, 2), 'utf-8'),

  getStudioId: (id) => {
    if (typeof id === 'number' && ghibli.studios[id]) return ghibli.studios[id];
    if (typeof id === 'string' && ghibli.studios.includes(id)) return id;
    return null;
  },

  getNewToken: async () => {
    try {
      const url = `${ghibli.api.base}${ghibli.api.endpoints.paygate('/token')}`;

      const res = await axios.post(
        url,
        { 
            appId: ghibli.creds.appId, 
            secretKey: ghibli.creds.secretKey 
          },
       {
          headers: { 
            ...ghibli.headers, 
            'content-type': 'application/json'
        },
          validateStatus: () => true,
        }
      );

      if (res.status !== 200 || res.data?.status?.code !== '200') {
        return {
          success: false,
          code: res.status || 500,
          result: { 
            error: res.data?.status?.message || 'Gagal ambil tokennya bree 😂' 
          },
        };
      }

      const { token, tokenExpire, encryptionKey } = res.data.data;
      ghibli.writeDB({ token, tokenExpire, encryptionKey });

      return { 
        success: true, 
        code: 200, 
        result: { 
            token, 
            tokenExpire, 
            encryptionKey
       }
     };
    } catch (err) {
      return { success: false, code: err?.response?.status || 500, result: { error: err.message } };
    }
  },

  getToken: async () => {
    const db = ghibli.readDB();
    const now = Date.now();

    if (db && db.token && db.tokenExpire && now < db.tokenExpire) {
      ghibli.log('✅ Pake token dari db yak bree... 🥴');
      return { 
        success: true, 
        code: 200, 
        result: db 
      };
    }

    ghibli.log('♻️ Tokennya expired atau kosong bree... otewe bikin token baru ye gasih 😂');
    return await ghibli.getNewToken();
  },

  generate: async ({ studio, filePath }) => {
    const studioId = ghibli.getStudioId(studio);
    if (!studioId) {
      return {
        success: false,
        code: 400,
        result: {
          error: `Studionya kudu pake index (0-${ghibli.studios.length - 1}) yak bree 🗿\n• Daftar: ${ghibli.studios.map((id, i) => `[${i}] ${id}`).join(', ')}`,
        },
      };
    }

    if (!filePath || filePath.trim() === '' || !fs.existsSync(filePath)) {
      return {
        success: false,
        code: 400,
        result: { 
            error: 'Imagenya kagak boleh kosong 🗿'
         },
      };
    }

    try {
      const toket = await ghibli.getToken();
      if (!toket.success) return toket;

      const { token } = toket.result;

      const form = new FormData();
      form.append('studio', studioId);
      form.append('file', fs.createReadStream(filePath), {
        filename: filePath.split('/').pop(),
        contentType: 'image/jpeg',
      });

      const url = `${ghibli.api.base}${ghibli.api.endpoints.ghibli('/edit-theme')}?uuid=1212`;

      const res = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
          ...ghibli.headers,
          authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (res.status !== 200 || res.data?.status?.code !== '200') {
        return {
          success: false,
          code: res.status || 500,
          result: { 
            error: res.data?.status?.message || res.data?.message || `${res.status}`
          },
        };
      }

      const { imageId, imageUrl, imageOriginalLink } = res.data.data;
      return { 
        success: true, 
        code: 200, 
        result: { 
            imageId, 
            imageUrl, 
            imageOriginalLink
        }
      };
    } catch (err) {
      return { 
        success: false, 
        code: err?.response?.status || 500, 
        result: { 
            error: err.message
        }
     };
    }
  },
};

export { ghibli };