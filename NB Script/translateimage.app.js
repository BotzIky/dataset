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
import fs from "fs";
import path from "path";

class TranslateImageClient {
  constructor() {
    this.defaultHeaders = {
      accept: "*/*",
      "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7",
      origin: "https://translateimage.app",
      referer: "https://translateimage.app/",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
    };
  }

  getHeaders(extra = {}) {
    return {
      ...this.defaultHeaders,
      ...extra,
    };
  }

  async getUploadCredentials(fileName = "image.jpg", fileType = "image/jpeg") {
    const headers = this.getHeaders({
      authority: "translateimage.app",
      "content-type": "application/json",
      referer: "https://translateimage.app/product-image-translator",
    });

    const response = await axios.post(
      "https://translateimage.app/api/translate/ecommerce/upload/credentials",
      { fileName, fileType },
      { headers },
    );

    return response.data;
  }

  async uploadToAliyunOSS(localFilePath, credentials) {
    const { host, dir, accessId, policy, signature, callback, fileUrl } =
      credentials;
    const fileName = path.basename(localFilePath);
    const ossKey = path.posix.join(dir, fileName);

    const form = new FormData();
    form.append("key", ossKey);
    form.append("OSSAccessKeyId", accessId);
    form.append("policy", policy);
    form.append("Signature", signature);
    form.append("success_action_status", "200");
    form.append("callback", callback);
    form.append("file", fs.createReadStream(localFilePath));

    const res = await axios.post(host, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    if (res.status === 200) {
      return fileUrl.replace("image.jpg", fileName);
    } else {
      throw new Error(`OSS Upload failed: ${res.status}`);
    }
  }

  async translateEcommerce(
    imageUrl,
    sourceLanguage = "auto",
    targetLanguage = "en",
    commodityProtection = true,
    detectionMode = "default",
    textDirection = "auto",
  ) {
    const headers = this.getHeaders({
      authority: "translateimage.app",
      "content-type": "application/json",
    });

    const payload = {
      imageUrl,
      sourceLanguage,
      targetLanguage,
      commodityProtection,
      detectionMode,
      textDirection,
    };

    const response = await axios.post(
      "https://translateimage.app/api/translate/ecommerce",
      payload,
      { headers },
    );

    return response.data;
  }

  async translateImage(buffer, filename, from = "auto", to = "en") {
    const form = new FormData();
    form.append("image", buffer, filename);
    form.append("from", from);
    form.append("to", to);

    const headers = this.getHeaders({
      ...form.getHeaders(),
      authority: "api.translateimage.app",
      userfingerprint: Date.now(),
    });

    const response = await axios.post(
      "https://api.translateimage.app/api/translate/image",
      form,
      { headers },
    );

    return response.data;
  }

  async translateManga(
    buffer,
    filename,
    from = "auto",
    to = "ENG",
    detectionMode = "default",
    textDirection = "auto",
  ) {
    const form = new FormData();
    form.append("image", buffer, filename);
    form.append("from", from);
    form.append("to", to);
    form.append("detection_mode", detectionMode);
    form.append("text_direction", textDirection);

    const headers = this.getHeaders({
      ...form.getHeaders(),
      authority: "api.translateimage.app",
      userfingerprint: Date.now(),
    });

    const response = await axios.post(
      "https://api.translateimage.app/api/translate/manga",
      form,
      { headers },
    );

    return response.data;
  }

  async uploadFile(localFilePath) {
    const fileName = path.basename(localFilePath);
    const credentials = await this.getUploadCredentials(fileName);
    const imageUrl = await this.uploadToAliyunOSS(localFilePath, credentials);
    return imageUrl;
  }
}

export default TranslateImageClient;

const client = new TranslateImageClient();

(async () => {
  const imagePath = "./tmp/milaait.png";
  const buffer = fs.readFileSync(imagePath);

  console.log("🖼️ 1. Translate gambar biasa...");
  const imageResult = await client.translateImage(
    buffer,
    "milaait.png",
    "auto",
    "en",
  );
  console.log("✅ /translate/image result:", imageResult);

  console.log("\n📚 2. Translate manga...");
  const mangaResult = await client.translateManga(
    buffer,
    "milaait.png",
    "auto",
    "ENG",
    "default",
    "vertical",
  );
  console.log("✅ /translate/manga result:", mangaResult);

  console.log("\n⬆️ 3. Upload ke OSS...");
  const uploaded = await client.uploadFile(imagePath);
  console.log("✅ Uploaded Successfully:", uploaded);

  console.log("\n🛍️ 4. Translate ecommerce dengan URL upload tadi...");
  const ecommerceResult = await client.translateEcommerce(
    uploaded,
    "auto",
    "en",
  );
  console.log("✅ /translate/ecommerce result:", ecommerceResult);

  console.log("\n🚀 Selesai.");
})();
