/***
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 *** - Dev: FongsiDev
 *** - Contact: t.me/dashmodz
 *** - Gmail: fongsiapi@gmail.com & fgsidev@neko2.net
 *** - Group: chat.whatsapp.com/Ke94ex9fNLjE2h8QzhvEiy
 *** - Telegram Group: t.me/fongsidev
 *** - Github: github.com/Fgsi-APIs/RestAPIs/issues/new
 *** - Huggingface: huggingface.co/fgsi1
 *** - Website: fgsi1-restapi.hf.space
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 ***/

// Scraper By Fgsi

import axios from "axios";

class RecapioClient {
  constructor(videoUrl) {
    this.videoUrl = videoUrl;
    this.videoId = this.extractVideoId(videoUrl);
    this.fingerprint = btoa(Date.now().toString());
    this.baseUrl = "https://api.recapio.com";
    this.headers = {
      authority: "api.recapio.com",
      "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,Fgsi",
      origin: "https://recapio.com",
      referer: "https://recapio.com/",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132,Fgsi"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36,Fgsi",
      "x-app-language": "en",
      "x-device-fingerprint": this.fingerprint,
    };
  }

  extractVideoId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
  }

  async initiate() {
    try {
      const res = await axios.post(
        `${this.baseUrl}/youtube-chat/initiate`,
        {
          url: this.videoUrl,
        },
        {
          headers: this.headers,
        },
      );
      return res.data;
    } catch (e) {
      throw e?.response?.data.error || e;
    }
  }

  async checkStatus(slug) {
    try {
      const res = await axios.get(
        `${this.baseUrl}/youtube-chat/status/by-slug/${slug}`,
        {
          params: {
            fingerprint: this.fingerprint,
          },
          headers: this.headers,
        },
      );
      if (res.data?.transcript)
        res.data.transcript = JSON.parse(res.data.transcript);
      return res.data;
    } catch (e) {
      throw e?.response?.data.error || e;
    }
  }

  async start() {
    try {
      const init = await this.initiate();
      const status = await this.checkStatus(init.slug);
      return { info: init, slug_ai: status };
    } catch (e) {
      throw e;
    }
  }

  async sendMessage(prompt) {
    const res = await axios.post(
      `${this.baseUrl}/youtube-chat/message`,
      {
        message: prompt,
        video_id: this.videoId,
        fingerprint: this.fingerprint,
      },
      {
        headers: {
          ...this.headers,
          accept: "text/event-stream",
          "content-type": "application/json",
        },
        responseType: "text",
      },
    );

    let result = "";
    for (const line of res.data.split("\n")) {
      if (line.startsWith("data:")) {
        try {
          const chunk = JSON.parse(line.slice(5).trim());
          result += chunk.chunk || "";
        } catch (e) {}
      }
    }
    return result;
  }
}

(async () => {
  const recapio = new RecapioClient("https://youtu.be/5TAD8bvXefU");

  const videoData = await recapio.start();
  console.log("Info Video:", videoData);

  const summary = await recapio.sendMessage(
    "Extract the most important bullet points from this video, organized in a clear, structured format.",
  );
  console.log("Summary:", summary);
})();
