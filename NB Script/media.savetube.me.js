/*

Noted : Downloader YouTube Support video/audio dengan resolusi 144p - 1080p
By : Danzz (Hitori Api)

*/

const crypto = require('crypto'); 

class Youtubers {
  constructor() {
    this.hex = "C5D58EF67A7584E4A29F6C35BBC4EB12";
  }

  async uint8(hex) {
    const pecahan = hex.match(/[\dA-F]{2}/gi);
    if (!pecahan) throw new Error("Format tidak valid");
    return new Uint8Array(pecahan.map(h => parseInt(h, 16)));
  }

  b64Byte(b64) {
    const bersih = b64.replace(/\s/g, "");
    const biner = atob(bersih);
    const hasil = new Uint8Array(biner.length);
    for (let i = 0; i < biner.length; i++) hasil[i] = biner.charCodeAt(i);
    return hasil;
  }

  async key() {
    const raw = await this.uint8(this.hex);
    return await crypto.subtle.importKey("raw", raw, { name: "AES-CBC" }, false, ["decrypt"]);
  }

  async Data(base64Terenkripsi) {
    const byteData = this.b64Byte(base64Terenkripsi);
    if (byteData.length < 16) throw new Error("Data terlalu pendek");

    const iv = byteData.slice(0, 16);
    const data = byteData.slice(16);

    const kunci = await this.key();
    const hasil = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      kunci,
      data
    );

    const teks = new TextDecoder().decode(new Uint8Array(hasil));
    return JSON.parse(teks);
  }

  async getCDN() {
    const res = await fetch("https://media.savetube.me/api/random-cdn");
    const data = await res.json();
    return data.cdn;
  }

  async infoVideo(linkYoutube) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/v2/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkYoutube }),
    });

    const hasil = await res.json();
    if (!hasil.status) throw new Error(hasil.message || "Gagal ambil data video");

    const isi = await this.Data(hasil.data);
    return {
      judul: isi.title,
      durasi: isi.durationLabel,
      thumbnail: isi.thumbnail,
      kode: isi.key,
      kualitas: isi.video_formats.map(f => ({
        label: f.label,
        kualitas: f.height,
        default: f.default_selected
      })),
      infoLengkap: isi
    };
  }

  async getDownloadLink(kodeVideo, kualitas, type) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        downloadType: kualitas === "128" ? "audio" : type,
        quality: kualitas,
        key: kodeVideo,
      }),
    });

    const json = await res.json();
    if (!json.status) throw new Error(json.message);
    return json.data.downloadUrl;
  }

  async downloadyt(linkYoutube, kualitas, type) {
    try {
      const data = await this.infoVideo(linkYoutube);
      const linkUnduh = await this.getDownloadLink(data.kode, kualitas, type);
      return {
        status: true,
        judul: data.judul,
        kualitasTersedia: data.kualitas,
        thumbnail: data.thumbnail,
        durasi: data.durasi,
        url: linkUnduh,
      };
    } catch (err) {
      return {
        sukses: false,
        pesan: err.message
      };
    }
  }
}

//testing ngab
(async () => {
  const yt = new Youtubers();
  const hasil = await yt.downloadyt("https://youtu.be/yJg-Y5byMMw?si=SMDaIUje-gaBTRZQ", "128", "audio");
  console.log(hasil);
})();