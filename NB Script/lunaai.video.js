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

class LunaAI {
  constructor(debug = false) {
    this.debug = debug;
    this.bypassUrl = "https://fgsi.koyeb.app/api/tools/bypasscf/v5";
    this.createUrl =
      "https://aiarticle.erweima.ai/api/v1/secondary-page/api/create";
    this.statusUrl = "https://aiarticle.erweima.ai/api/v1/secondary-page/api/";
    this.referer = "https://lunaai.video/";
    this.origin = "https://lunaai.video";
    this.sitekey = "0x4AAAAAAAdJZmNxW54o-Gvd";
  }

  async bypassCF(url, apikey) {
    const res = await axios.get(this.bypassUrl, {
      params: {
        apikey,
        url,
        sitekey: this.sitekey,
        mode: "turnstile-min",
      },
      headers: {
        accept: "application/json",
      },
    });
    return res.data?.data?.token;
  }

  async createVideo(token, payload) {
    const headers = {
      authority: "aiarticle.erweima.ai",
      "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
      origin: this.origin,
      referer: this.referer,
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      verify: token,
      uniqueid: btoa(Date.now()),
    };

    const res = await axios.post(this.createUrl, payload, { headers });
    return res.data?.data?.recordId;
  }

  async checkStatus(recordId) {
    const res = await axios.get(this.statusUrl + recordId, {
      headers: {
        authority: "aiarticle.erweima.ai",
        accept: "application/json, text/plain, */*",
        "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
        origin: this.origin,
        referer: this.referer,
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      },
    });

    return res.data?.data;
  }

  async run({
    apikey = "your apikey",
    prompt,
    imgUrls = [],
    quality = "720p",
    duration = 8,
    autoSoundFlag = false,
    soundPrompt = "",
    autoSpeechFlag = false,
    speechPrompt = "",
    speakerId = "Auto",
    aspectRatio = "16:9",
    secondaryPageId = 1946,
    channel = "VEO3",
    source = "lunaai.video",
    type = "features",
    watermarkFlag = false,
    privateFlag = false,
    isTemp = true,
    vipFlag = false,
    model = "veo-3-fast",
  }) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.bypassCF(
          "https://lunaai.video/features/v3-fast",
          apikey
        );
        if (!token)
          return reject(new Error("Bypass token failed to be obtained"));
        this.debug && console.log('[🛡️ Bypass Success] Token:', token);

        const payload = {
          prompt,
          imgUrls,
          quality,
          duration,
          autoSoundFlag,
          soundPrompt,
          autoSpeechFlag,
          speechPrompt,
          speakerId,
          aspectRatio,
          secondaryPageId,
          channel,
          source,
          type,
          watermarkFlag,
          privateFlag,
          isTemp,
          vipFlag,
          model,
        };

        const recordId = await this.createVideo(token, payload);
        if (!recordId) return reject(new Error("Failed to get a Record ID"));
        this.debug && console.log('[🎬 Video Requested] Record ID:', recordId);

        const interval = setInterval(async () => {
          try {
            const data = await this.checkStatus(recordId);
            if (data.state === "success" && data.completeData) {
              clearInterval(interval);
              const result = JSON.parse(data.completeData);
              this.debug && console.log('[✅ Success]');
              resolve(result);
            } else if (data.failCode || data.failMsg) {
              clearInterval(interval);
              reject(new Error(`[❌ Failed] ${data.failCode} ${data.failMsg}`));
            } else {
              this.debug && console.log('[⌛ Still Processing]');
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 5000);
      } catch (err) {
        reject(err);
      }
    });
  }
}

// Jalankan
const app = new LunaAI();

app
  .run({
    apikey: "your apikey",
    prompt: "World running in future with AI"
  })
  .then((result) => {
    console.log("[📦 Final Result]");
    console.log(result);
  })
  .catch((err) => {
    console.error("[🚨 Error]", err.message);
  });

//Payload nya default bre 🗿