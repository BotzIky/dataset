import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createDecipheriv } from 'crypto';

const ghibai = {
  api: {
    base: 'https://generate-api.ghibli-gpt.net',
    endpoints: {
      generate: '/v1/gpt4o-image/generate',
      task: '/v1/gpt4o-image/record-info',
    },
  },

  headers: {
    accept: '*/*',
    'content-type': 'application/json',
    origin: 'https://ghibli-gpt.net',
    referer: 'https://ghibli-gpt.net/',
    'user-agent': 'NB Android/1.0.0',
    authorization: ''
  },

  state: { token: null },

  security: {
    keyBase64: 'UBsnTxs80g8p4iW72eYyPaDvGZbpzun8K2cnoSSEz1Y',
    ivBase64: 'fG1SBDUyE2IG8kPw',
    ciphertextBase64: '2QpqZCkOD/WMHixMqt46AvhdKRYgy5aUMLXi6D0nOPGuDbH4gbNKDV0ZW/+9w9I=',

    decrypt: async () => {
      if (ghibai.state.token) return ghibai.state.token;

      const buf = k => Buffer.from(ghibai.security[k], 'base64');
      const [key, iv, ciphertext] = ['keyBase64', 'ivBase64', 'ciphertextBase64'].map(buf);

      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(ciphertext.slice(-16));

      const decrypted = decipher.update(ciphertext.slice(0, -16), undefined, 'utf8') + decipher.final('utf8');
      ghibai.state.token = decrypted;
      ghibai.headers.authorization = `Bearer ${decrypted}`;
      return decrypted;
    }
  },

  filenamex: (ext = 'jpg') => `ghibli_${Date.now()}_${Math.random().toString(16).slice(2, 10)}.${ext}`,

  prepare: async input => !input || typeof input !== 'string' ? { filesUrl: [''], files: [''] } :
    /^data:image\//.test(input) ? { filesUrl: [''], files: [input] } :
    /^https?:\/\//.test(input) ? { filesUrl: [input], files: [''] } :
    fs.existsSync(input) ? (() => {
      const ext = path.extname(input).slice(1).toLowerCase();
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                   ext === 'png' ? 'image/png' :
                   ext === 'webp' ? 'image/webp' : null;
      if (!mime) return { filesUrl: [''], files: [''] };
      const raw = fs.readFileSync(input).toString('base64');
      return { filesUrl: [''], files: [`data:${mime};base64,${raw}`] };
    })() :
    { filesUrl: [''], files: [''] },

  getTask: async (taskId, prompt = '') => {
    await ghibai.security.decrypt();

    let lastStatus = '', lastProgress = '';

    for (let i = 0; i < 60; i++) {
      try {
        const { data } = await axios.get(`${ghibai.api.base}${ghibai.api.endpoints.task}?taskId=${taskId}`, { headers: ghibai.headers });
        const d = data?.data || {};
        const status = d.status || '🗿';
        const progress = parseFloat(d.progress || '0').toFixed(2);

        const line = `⏳ Status: ${status} | Progress: ${progress}`;
        if (status !== lastStatus || progress !== lastProgress) {
          process.stdout.write(`\r${line}`);
          lastStatus = status;
          lastProgress = progress;
        }

        if (status === 'SUCCESS' && d.response?.resultUrls?.length) {
          console.log();
          return {
            success: true,
            code: 200,
            result: {
              type: 'image',
              prompt,
              taskId,
              progress,
              link: d.response.resultUrls[0],
              thumbnail: d.response.thumbnailUrls?.[0],
              source: d.response.sourceUrls?.[0]
            }
          };
        }

        await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        const status = err.response?.status || 500;
        if (status === 429) {
          process.stdout.write('\r⚠️Too Many Request bree... Coba ulang yak... ');
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        console.log();
        return {
          success: false,
          code: status,
          result: { 
            error: err.message, 
          }
        };
      }
    }

    console.log();
    return {
      success: false,
      code: 504,
      result: {
        error: 'Skip aja dah bree... 😂',
      }
    };
  },

  generate: async (prompt, imagesx = null, size = '2:3', nVariants = 1) => {
    if (!prompt?.trim()) 
    return { 
        success: false, 
        code: 400, 
        result: { 
            error: 'Yang bener ajaa, Promptnya kosong begini 😂 Kocak lu anjirr wkwk'
         }
      };
    if (!imagesx || (typeof imagesx === 'string' && imagesx.trim() === '')) 
    return { 
        success: false, 
        code: 400, 
        result: { 
            error: 'Gambarnya juga kagak boleh kosong begini atuh bree, yaelah 🫵🏻🗿'
       }
    };

    const { filesUrl, files } = await ghibai.prepare(imagesx);
    if ((!filesUrl[0] && !files[0]) || (filesUrl[0] === '' && files[0] === '')) {
      return { 
        success: false, 
        code: 400, 
        result: { 
            error: 'Anjaii.. format image apaan nih 😂'
      }
     };
    }

    await ghibai.security.decrypt();

    try {
      const { data } = await axios.post(
        `${ghibai.api.base}${ghibai.api.endpoints.generate}`,
        { filesUrl, files, prompt, size, nVariants },
        { headers: ghibai.headers }
      );

      const taskId = data?.data?.taskId;
      if (!taskId) 
      return { 
        success: false, 
        code: 500, 
        result: { 
            error: 'Task Id nya kagak muncul bree 😏'
        }
      };

      console.log('📤 Gambar berhasil di upload...');
      console.log('⏳ Menunggu response dari server...');

      return await ghibai.getTask(taskId, prompt);

    } catch (err) {
      const status = err.response?.status || 500;
      if (status === 429) {
        console.warn('\n⚠️  Too Many Request bree... Coba ulang yak...');
        await new Promise(r => setTimeout(r, 5000));
        return await ghibai.generate(prompt, imagesx, size, nVariants);
      }
      return { 
        success: false, 
        code: status, 
        result: { 
            error: err.message
       }
     };
    }
  }
};

export { ghibai };
