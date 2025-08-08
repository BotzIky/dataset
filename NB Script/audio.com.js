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
import fs from "fs";

export default class AudioTranscriber {
  constructor(debug = false) {
    this.debug = debug;
    this.cookies = {};
    this.cookieHeader = "";
    this.transcriptionId = null;
    this.audioInfo = null;
  }

  async initSession() {
    const response = await axios.get("https://audio.com/transcription", {
      headers: {
        authority: "audio.com",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      },
    });

    const rawCookies = response.headers["set-cookie"] || [];
    this.cookieHeader = rawCookies.map((c) => c.split(";")[0]).join("; ");
    this.cookies = Object.fromEntries(
      this.cookieHeader.split("; ").map((c) => {
        const [name, value] = c.split("=");
        return [name, decodeURIComponent(value)];
      }),
    );
  }

  getAnalyticsHeader() {
    return JSON.stringify({
      device_id: this.cookies["device-id"],
      session_id: this.cookies["session-id"],
      member_experiment_id: this.cookies["experiment_member_id"],
    });
  }

  async requestUpload() {
    const response = await axios.post(
      "https://api.audio.com/audio",
      {
        mime: "audio/mpeg",
        name: this.fileName,
        size: this.fileBuffer.length,
        category: 7,
        downloadable: false,
        options: { transcribe: true },
        method: "PUT",
      },
      {
        headers: {
          authority: "api.audio.com",
          accept: "application/json",
          "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          "content-type": "application/json",
          origin: "https://audio.com",
          referer: "https://audio.com/",
          "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
          "x-analytics-context": this.getAnalyticsHeader(),
        },
      },
    );

    this.audioInfo = response.data;
    this.transcriptionId = response.data.extra.audio.id;
    return response.data;
  }

  async uploadFile() {
    const putResponse = await axios.put(this.audioInfo.url, this.fileBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": this.fileBuffer.length,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    this.debug ?? console.log("Upload status:", putResponse.status);
  }

  async notifyUploadSuccess() {
    const response = await axios.post(this.audioInfo.success, {});
    this.debug ?? console.log("Success status:", response.status);
  }

  async checkTranscriptionStatus() {
    const response = await axios.get("https://api.audio.com/audio", {
      params: { id: this.transcriptionId },
      headers: {
        authority: "api.audio.com",
        accept: "application/json",
        "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        origin: "https://audio.com",
        referer: "https://audio.com/",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "x-analytics-context": this.getAnalyticsHeader(),
      },
    });

    const data = response.data;
    return data[0]?.transcribed;
  }

  async getTranscriptionText() {
    const response = await axios.get(
      `https://api.audio.com/audio/${this.transcriptionId}/transcription`,
      {
        headers: {
          authority: "api.audio.com",
          accept: "application/json",
          "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          origin: "https://audio.com",
          referer: "https://audio.com/",
          "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
          "x-analytics-context": this.getAnalyticsHeader(),
        },
      },
    );
    return response.data;
  }

  async transcribeWithPolling(intervalMs = 5000) {
    await this.initSession();
    await this.requestUpload();
    await this.uploadFile();
    await this.notifyUploadSuccess();

    this.debug ?? console.log("Waiting for transcription...");

    return new Promise((resolve, reject) => {
      const poll = setInterval(async () => {
        try {
          const done = await this.checkTranscriptionStatus();
          if (done) {
            const result = await this.getTranscriptionText();
            const { text, language, error } = result;
            if (error && error.trim() !== "") {
              clearInterval(poll);
              return reject(new Error(`Transcription error: ${error}`));
            }
            if (
              text &&
              text.trim() !== "" &&
              language &&
              language.trim() !== ""
            ) {
              clearInterval(poll);
              return resolve(result);
            }
          }
        } catch (err) {
          clearInterval(poll);
          reject(err);
        }
      }, intervalMs);
    });
  }

  async transcribeStart(filePath) {
    this.filePath = filePath;
    this.fileName = filePath.split("/").pop();
    this.fileBuffer = fs.readFileSync(filePath);
    return this.transcribeWithPolling();
  }
}

const transcriber = new AudioTranscriber();
console.log(
  await transcriber.transcribeStart("./Allah Karim - Nissa Sabyan.mp3"),
);
