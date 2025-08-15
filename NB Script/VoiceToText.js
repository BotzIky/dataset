import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const stt = {
  api: {
    base: 'https://www.speech-to-text.cloud',
    endpoints: {
      upload: '/athanis/upload',
      transcribe: (fid) => `/athanis/transcribe/${fid}/yyy`
    }
  },

  headers: {
    origin: 'https://www.speech-to-text.cloud',
    referer: 'https://www.speech-to-text.cloud/',
    'user-agent': 'NB Android/1.0.0'
  },

  upload: async (filePath) => {
    if (!filePath || !fs.existsSync(filePath)) {
      return {
        success: false,
        code: 400,
        result: { 
            error: 'File audionya mana? Mau transcribe kok kagak ada audionya 🗿' 
        }
      };
    }

    try {
      const form = new FormData();
      form.append('audio_file', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: 'audio/mpeg'
      });

      const res = await axios.post(
        `${stt.api.base}${stt.api.endpoints.upload}`,
        form,
        {
          headers: {
            ...stt.headers,
            ...form.getHeaders()
          }
        }
      );

      const fid = res.data?.fid;
      if (!fid) {
        return {
          success: false,
          code: 500,
          result: { error: 'FID tokennya kagak ada bree..' }
        };
      }

      return { 
        success: true, 
        code: 200, 
        result: { 
            fid 
         }
      };
    } catch (err) {
      if (err?.response?.status === 429) {
        return {
          success: false,
          code: 429,
          result: { 
            error: 'Kebanyakan request bree.. coba lagi nanti yak.. 🙃'
          }
        };
      }
      return {
        success: false,
        code: err?.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  transcribe: async (fid) => {
    if (!fid) {
      return {
        success: false,
        code: 400,
        result: { error: 'FID tokennya gak ada... Coba lagi nanti ✌🏻' }
      };
    }

    const url = `${stt.api.base}${stt.api.endpoints.transcribe(fid)}`;
    let teks = '';

    try {
      const res = await axios.get(url, {
        headers: {
          ...stt.headers,
          accept: '*/*'
        },
        responseType: 'stream',
        timeout: 0
      });

      await new Promise((resolve, reject) => {
        res.data.on('data', (chunk) => {
          const lines = chunk.toString('utf8').split(/\r?\n/);
          for (const line of lines) {
            if (!line) continue;

            if (line.startsWith('#progress#')) {
              process.stdout.write(`${line}\n`);
            } else {
              process.stdout.write(`${line}\n`);
              teks += line + '\n';
            }
          }
        });

        res.data.on('end', resolve);
        res.data.on('error', reject);
      });

      return {
        success: true,
        code: 200,
        result: { 
            transcript: teks.trim() || '🤷🏻' 
        }
      };
    } catch (err) {
      if (err?.response?.status === 429) {
        return {
          success: false,
          code: 429,
          result: { 
            error: 'Kebanyakan request bree.. coba lagi nanti yak.. 🙃'
          }
        };
      }
      return {
        success: false,
        code: err?.response?.status || 500,
        result: { 
            error: err.message
        }
      };
    }
  }
};

export { stt };