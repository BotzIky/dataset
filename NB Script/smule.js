/**
 * Telegram Channel Search
 * Author : gienetic
 * Base   : https://sownloader.com
 */
 

const axios = require("axios");
const cheerio = require("cheerio");

async function smuledl(smuleUrl) {
  if (!smuleUrl) return { status: false, msg: "URL Smule wajib diisi" };

  const target = "https://sownloader.com/index.php?url=" + encodeURIComponent(smuleUrl);

  try {
    const { data } = await axios.get(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html",
      }
    });

    const $ = cheerio.load(data);

    const title = $("h4 a").first().text().trim();
    const smule_link = $("h4 a").attr("href");
    const thumbnail = $(".sownloader-web-thumbnail").attr("src");
    const description = $(".sownloader-web-thumbnail")
      .closest(".row")
      .find("p")
      .first()
      .text()
      .trim();

    let audio_m4a = $("a.btn[href*='.m4a']").attr("href");
    if (audio_m4a && audio_m4a.startsWith("/")) {
      audio_m4a = "https://sownloader.com" + audio_m4a;
    }

    let audio_mp3 = $("button.btn:contains('Download as MP3')").attr("onclick");
    if (audio_mp3) {
      const match = audio_mp3.match(/'(https?:\/\/[^']+\.m4a)'/);
      if (match) {
        audio_mp3 = "https://sownloader.com/system/modules/downloader.php?url=" +
          encodeURIComponent(match[1]) +
          `&name=${encodeURIComponent(title)}&ext=mp3`;
      }
    }

    let video_mp4 = $("a.btn[href*='.mp4']").attr("href");
    if (video_mp4 && video_mp4.startsWith("/")) {
      video_mp4 = "https://sownloader.com" + video_mp4;
    }

    return {
      status: true,
      metadata: {
        title,
        smule_link,
        thumbnail,
        description
      },
      audio: {
        m4a: audio_m4a,
      },
      video: {
        mp4: video_mp4
      }
    };
  } catch (err) {
    return { status: false, msg: err.message };
  }
}

module.exports = smuledl;