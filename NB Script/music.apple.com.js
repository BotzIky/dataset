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

export class AppleMusicDownloader {
  constructor() {
    this.baseUrl = "https://aaplmusicdownloader.com";
    this.userAgent =
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36";
    this.headers = {
      authority: "aaplmusicdownloader.com",
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": this.userAgent,
      "x-requested-with": "XMLHttpRequest",
    };
  }

  async search(url) {
    const response = await axios.get(`${this.baseUrl}/api/applesearch.php`, {
      params: { url },
      headers: {
        ...this.headers,
        referer: `${this.baseUrl}/`,
      },
    });
    return response.data;
  }

  async getSessionCookie() {
    const response = await axios.get(this.baseUrl, {
      headers: {
        ...this.headers,
        referer: `${this.baseUrl}/`,
      },
    });
    const setCookie = response.headers["set-cookie"]?.[0];
    if (!setCookie) throw new Error("No Set-Cookie header found");
    const cookie = setCookie.split(";")[0];
    return cookie;
  }

  async download({
    songName,
    artistName,
    url,
    quality = "m4a", //m4a, 128, 192, 256, 320, 64
    zipDownload = false,
  }) {
    const cookie = await this.getSessionCookie();
    const form = new URLSearchParams({
      song_name: songName,
      artist_name: artistName,
      url,
      token: "none",
      zip_download: zipDownload.toString(),
      quality,
    });

    const response = await axios.post(
      `${this.baseUrl}/api/composer/swd.php`,
      form,
      {
        headers: {
          ...this.headers,
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: cookie,
          origin: this.baseUrl,
          referer: `${this.baseUrl}/song.php`,
        },
      },
    );

    return response.data;
  }
}

const downloader = new AppleMusicDownloader();

const searchResult = await downloader.search(
  "https://music.apple.com/us/album/allah-karim/1709091508?i=1709091510",
);
console.log("Search:", searchResult);

const downloadResult = await downloader.download({
  songName: searchResult.name,
  artistName: searchResult.artist,
  url: searchResult.url,
  quality: "m4a",
});
console.log("Download:", downloadResult);
