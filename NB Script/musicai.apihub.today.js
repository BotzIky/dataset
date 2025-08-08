import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';

const sonu = {
  api: {
    base: 'https://musicai.apihub.today/api/v1',
    endpoints: {
      register: '/users',
      create: '/song/create',
      checkStatus: '/song/user'
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0',
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-platform': 'android',
    'x-app-version': '1.0.0',
    'x-country': 'ID',
    'accept-language': 'id-ID',
    'x-client-timezone': 'Asia/Jakarta'
  },

  deviceId: uuidv4(),
  userId: null,
  fcmToken: 'eqnTqlxMTSKQL5NQz6r5aP:APA91bHa3CvL5Nlcqx2yzqTDAeqxm_L_vIYxXqehkgmTsCXrV29eAak6_jqXv5v1mQrdw4BGMLXl_BFNrJ67Em0vmdr3hQPVAYF8kR7RDtTRHQ08F3jLRRI',

  register: async () => {
    const msgId = uuidv4();
    const time = Date.now().toString();
    const header = {
      ...sonu.headers,
      'x-device-id': sonu.deviceId,
      'x-request-id': msgId,
      'x-message-id': msgId,
      'x-request-time': time
    };

    try {
      const response = await axios.put(
        `${sonu.api.base}${sonu.api.endpoints.register}`,
        {
          deviceId: sonu.deviceId,
          fcmToken: sonu.fcmToken
        },
        { headers: header }
      );
      sonu.userId = response.data.id;
      return {
        success: true,
        code: 200,
        result: { userId: sonu.userId }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  create: async ({ title, mood, genre, lyrics, gender }) => {
    if (!title || title.trim() === '') {
      return {
        success: false,
        code: 400,
        result: { error: "Judul lagunya kagak boleh kosong bree 😂" }
      };
    }
    if (!lyrics || lyrics.trim() === '') {
      return {
        success: false,
        code: 400,
        result: { error: "Lirik lagunya mana? Mau generate lagu kan? Yaa mana liriknya 😂" }
      };
    }
    if (lyrics.length > 1500) {
      return {
        success: false,
        code: 400,
        result: { error: "Lirik lagu kagak boleh lebih dari 1500 karakter yak bree 🗿"}
      };
    }

    const msgId = uuidv4();
    const time = Date.now().toString();
    const header = {
      ...sonu.headers,
      'x-device-id': sonu.deviceId,
      'x-client-id': sonu.userId,
      'x-request-id': msgId,
      'x-message-id': msgId,
      'x-request-time': time
    };

    const body = {
      type: 'lyrics',
      name: title,
      lyrics
    };
    if (mood && mood.trim() !== '') body.mood = mood;
    if (genre && genre.trim() !== '') body.genre = genre;
    if (gender && gender.trim() !== '') body.gender = gender;

    try {
      const response = await axios.post(
        `${sonu.api.base}${sonu.api.endpoints.create}`,
        body,
        { headers: header }
      );

      return {
        success: true,
        code: 200,
        result: { songId: response.data.id }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  task: async (songId) => {
    const header = {
      ...sonu.headers,
      'x-client-id': sonu.userId
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    try {
      let attempt = 0;
      let found = null;

      while (true) {
        const response = await axios.get(
          `${sonu.api.base}${sonu.api.endpoints.checkStatus}`,
          {
            params: {
              userId: sonu.userId,
              isFavorite: false,
              page: 1,
              searchText: ''
            },
            headers: header
          }
        );

        found = response.data.datas.find(song => song.id === songId);
        if (!found) {
          rl.close();
          return {
            success: false,
            code: 404,
            result: { error: "Lagunya belum jadi keknya bree, soalnya kagak ada 😂" }
          };
        }

        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`🔄 [${++attempt}] Status: ${found.status} | Proses: ${found.url ? '✅ Done' : '⏳ Loading...'}`);

        if (found.url) {
          rl.close();

          return {
            success: true,
            code: 200,
            result: {
              status: found.status,
              songId: found.id,
              title: found.name,
              username: found.username,
              url: found.url,
              thumbnail: found.thumbnail_url
            }
          };
        }

        await delay(3000);
      }
    } catch (err) {
      rl.close();
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  }
};

export { sonu };