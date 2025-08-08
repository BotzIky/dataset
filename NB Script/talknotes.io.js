/***
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 *** - Dev: FongsiDev
 *** - Contact: t.me/dashmodz
 *** - Gmail: fongsiapi@gmail.com & fgsidev@neko2.net
 *** - Group: chat.whatsapp.com/Ke94ex9fNLjE2h8QzhvEiy
 *** - Telegram Group: t.me/fongsidev
 *** - Github: github.com/Fgsi-APIs/RestAPIs/issues/new
 *** - Website: fgsi.koyeb.app
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 ***/

// Scraper By Fgsi

import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';
import crypto from 'crypto';
import fs from 'fs';

export default class TalkNotesClient {
  constructor() {
    this.baseUrl = 'https://talknotes.io';
    this.apiUrl = 'https://api.talknotes.io';
    this.userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36';
    this.toolsApiKey = null;
  }

  async init() {
    const response = await axios.get(`${this.baseUrl}/tools/transcribe-to-text`, {
      headers: {
        'user-agent': this.userAgent,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7',
        'upgrade-insecure-requests': '1',
      }
    });

    const $ = cheerio.load(response.data);
    $('script').each((_, el) => {
      const script = $(el).html();
      const match = script.match(/toolsApiKey:\s*"([a-f0-9\-]+)"/i);
      if (match) {
        this.toolsApiKey = match[1];
        return false;
      }
    });

    if (!this.toolsApiKey) {
      throw new Error('toolsApiKey not found');
    }
  }

  async transcribe(filePath) {
    if (!this.toolsApiKey) {
      throw new Error('toolsApiKey not initialized. Call init() first.');
    }

    const timestamp = Date.now();
    const hmac = crypto.createHmac('sha256', this.toolsApiKey);
    hmac.update(timestamp.toString());
    const token = hmac.digest('hex');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${this.apiUrl}/tools/converter`, form, {
      headers: {
        ...form.getHeaders(),
        'user-agent': this.userAgent,
        'origin': this.baseUrl,
        'referer': `${this.baseUrl}/`,
        'x-timestamp': timestamp,
        'x-token': token,
      }
    });

    return response.data;
  }
}

const talknotes = new TalkNotesClient();
await talknotes.init();
const result = await talknotes.transcribe('./tmp/VID-20250507-WA0288.mp3');
console.log(result);