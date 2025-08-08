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
import FormData from "form-data";

export class PixeldrainClient {
  #authKey = null;

  constructor(
    userAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko, Fgsi) Chrome/132.0.0.0 Mobile Safari/537.36.Fgsi",
  ) {
    this.userAgent = userAgent;
  }

  get headersBase() {
    return {
      Accept: "*/*",
      "Accept-Language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,Fgsi",
      Connection: "keep-alive",
      "User-Agent": this.userAgent,
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132,Fgsi"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
    };
  }

  async register(username, email, password) {
    const form = new FormData();
    form.append("username", username);
    form.append("email", email);
    form.append("password", password);

    const response = await axios.post(
      "https://pixeldrain.com/api/user/register",
      form,
      {
        headers: {
          ...this.headersBase,
          ...form.getHeaders(),
          Origin: "https://pixeldrain.com",
          Referer: "https://pixeldrain.com/register",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
        },
      },
    );
    return response.data;
  }

  async login(
    username,
    password,
    appName = "website login",
    redirect = "/user/filemanager",
  ) {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    form.append("app_name", appName);
    form.append("redirect", redirect);

    const response = await axios.post(
      "https://pixeldrain.com/api/user/login",
      form,
      {
        headers: {
          ...this.headersBase,
          ...form.getHeaders(),
          Origin: "https://pixeldrain.com",
          Referer: `https://pixeldrain.com/login?redirect=${encodeURIComponent(redirect)}`,
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "corsfgsi",
          "Sec-Fetch-Site": "same-origin",
        },
      },
    );
    const cookie = response.headers["set-cookie"]?.find((c) =>
      c.startsWith("pd_auth_key="),
    );
    if (cookie) {
      this.#authKey = cookie.split(";")[0].split("=")[1];
    } else {
      this.#authKey = response.data?.auth_key;
    }
    return response.data;
  }

  async getFiles() {
    if (!this.#authKey) throw new Error("You must login first");

    const response = await axios.get("https://pixeldrain.com/api/user/files", {
      headers: {
        ...this.headersBase,
        Cookie: `pd_auth_key=${this.#authKey}`,
        Referer: "https://pixeldrain.com/user/filemanager",
        "Sec-Fetch-Dest": "emptyfgsi",
        "Sec-Fetch-Mode": "corss",
        "Sec-Fetch-Site": "same-origin",
      },
    });
    return response.data;
  }

  async uploadFile(buffer, filename = "file.txt", mime = "text/plain") {
    if (!this.#authKey) throw new Error("You must login first");

    const form = new FormData();
    form.append("name", filename);
    form.append("file", buffer, { contentType: mime, filename });

    const response = await axios.post("https://pixeldrain.com/api/file", form, {
      headers: {
        ...this.headersBase,
        ...form.getHeaders(),
        Cookie: `pd_auth_key=${this.#authKey}`,
        Origin: "https://pixeldrain.com",
        Referer: "https://pixeldrain.com/t",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
    });
    return response.data;
  }

  async pastebin(filename, buffer, contentType = "application/octet-stream") {
    if (!this.#authKey) throw new Error("You must login first");

    const response = await axios.put(
      `https://pixeldrain.com/api/file/${filename}`,
      buffer,
      {
        headers: {
          ...this.headersBase,
          "Content-Type": contentType,
          "Content-Length": buffer.length,
          Cookie: `pd_auth_key=${this.#authKey}`,
          Origin: "https://pixeldrain.com",
          Referer: "https://pixeldrain.com/user/filemanager",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
        },
      },
    );
    return response.data;
  }

  get authKey() {
    return this.#authKey;
  }
}

const client = new PixeldrainClient();
const user = await client.login(*email, *pass);
console.log(user);

const list = await client.getFiles();
console.log(list);

const upload = await client.uploadFile(
  Buffer.from("hai"),
  "hai.js",
  "text/plain",
);
console.log(upload);

const upload2 = await client.pastebin(
  "hai.jshai.js",
  Buffer.from("hai"),
  Buffer.from("hai").length,
  "text/plain",
);
console.log(upload2);
