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

import axios from "axios";

export default class YesChatMusicGenerator {
  constructor(apikey = "your apikey") {
    this.apikey = apikey;
    this.userAgent =
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36";
  }

  async getBypassToken() {
    const res = await axios.get(
      "https://fgsi.koyeb.app/api/tools/bypasscf/v5",
      {
        params: {
          apikey: this.apikey,
          url: "https://www.yeschat.ai/",
          sitekey: "0x4AAAAAAATOXAtQtziH-Rwq",
          mode: "turnstile-min",
        },
        headers: {
          accept: "application/json",
        },
      },
    );
    return res.data?.data?.token;
  }

  async generateSongLyrics({
    prompt,
    title = "Tanpa Judul",
    style = "Happy",
    instrumental = false,
    customMode = true,
  }) {
    const token = await this.getBypassToken();
    if (!token || typeof token !== "string") {
      throw new Error("❌ failed to get bypass token.");
    }
    const res = await axios.post(
      "https://aiarticle.erweima.ai/api/v1/secondary-page/api/create",
      {
        prompt,
        channel: "MUSIC",
        id: 1018,
        type: "features",
        source: "yeschat.ai",
        style,
        title,
        customMode,
        instrumental,
      },
      {
        headers: {
          authority: "aiarticle.erweima.ai",
          accept: "application/json, text/plain, */*",
          "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
          origin: "https://www.yeschat.ai",
          referer: "https://www.yeschat.ai/",
          "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": this.userAgent,
          uniqueid: Date.now(),
          verify: token,
        },
      },
    );
    if (res.data.code !== 200) {
      throw new Error(res.data.msg || "Failed to generate lyrics");
    }
    const recordId = res.data?.data?.recordId;
    return this.pollGeneratedResult(recordId);
  }

  pollGeneratedResult(recordId, interval = 5000) {
    return new Promise((resolve, reject) => {
      const url = `https://aiarticle.erweima.ai/api/v1/secondary-page/api/${recordId}`;
      const timer = setInterval(async () => {
        try {
          const { data } = await axios.get(url, {
            headers: {
              authority: "aiarticle.erweima.ai",
              accept: "application/json, text/plain, */*",
              "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
              origin: "https://www.yeschat.ai",
              referer: "https://www.yeschat.ai/",
              "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
              "sec-ch-ua-mobile": "?1",
              "sec-ch-ua-platform": '"Android"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site",
              "user-agent": this.userAgent,
            },
          });
          if (data.code !== 200) {
            clearInterval(timer);
            return reject(new Error(data.msg || "Unexpected error"));
          }
          if (data.data?.failCode && data.data?.failMsg) {
            clearInterval(timer);
            return reject(new Error(data.data.failMsg));
          }
          if (data.data?.state && data.data.completeData) {
            clearInterval(timer);
            return resolve(JSON.parse(data.data.completeData));
          }
        } catch (err) {
          clearInterval(timer);
          return reject(err);
        }
      }, interval);
    });
  }
}

const generator = new YesChatMusicGenerator(" apikey kamu lohhhhh");
const result = await generator.generateSongLyrics({
  prompt: `[Intro]
Halo... ini lagu gue, BlueCkkn yang bikin.
Cek aja, semoga suka :)

[Verse 1]
Di pagi yang cerah, ku lihat senyummu
Langkah ringan kita menyusuri waktu
Tak perlu kata, kita saling tahu
Teman sejati, kau di sisiku

[Chorus]
Bersahabat, tak lekang oleh waktu
Dalam tawa, juga kala pilu
Kau dan aku, tak akan ragu
Melangkah bersama, selalu satu

[Verse 2]
Saat dunia seakan menjauh
Kau hadir dan buatku teduh
Tak ada jarak, tak ada keluh
Hati kita saling terpaut utuh

[Chorus]
Bersahabat, tak lekang oleh waktu
Dalam tawa, juga kala pilu
Kau dan aku, tak akan ragu
Melangkah bersama, selalu satu

[Bridge]
Walau badai datang menghadang
Kita tetap berjalan tenang
Karena ku tahu, kau di sisiku
Sahabat sejati, selamanya satu

[Outro]
Bersahabat...
Selalu satu...`,
  title: "Sahabat",
  style: "Happy",
});
console.log("✅ Lirik selesai:\n", result);
