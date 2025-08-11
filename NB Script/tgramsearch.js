/**
 * Telegram Channel Search
 * Author : gienetic
 * Base   : https://tgramsearch.com/
 */

const axios = require("axios");
const cheerio = require("cheerio");

// 🔍 Ambil link t.me asli dari halaman join
async function getRealTelegramLink(joinUrl) {
  try {
    const { data } = await axios.get(joinUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(data);
    const realLink = $('a[href^="tg://resolve"]').attr("href");

    if (realLink) {
      const username = realLink.split("tg://resolve?domain=")[1];
      return `https://t.me/${username}`;
    }
  } catch (e) {
    console.error(`💢 Gagal ambil link asli cuks: ${e.message}`);
  }
  return joinUrl; // fallback kalo gagal
}

// 🔍 Cari channel Telegram berdasarkan kata kunci
async function searchTelegramChannels(query) {
  try {
    console.log(`Wett... lagi nyari channel "${query}" nih cuks...`);
    const url = `https://en.tgramsearch.com/search?query=${encodeURIComponent(query)}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    for (const el of $(".tg-channel-wrapper").toArray()) {
      const name = $(el).find(".tg-channel-link a").text().trim();
      let link = $(el).find(".tg-channel-link a").attr("href");
      const image = $(el).find(".tg-channel-img img").attr("src");
      const members = $(el).find(".tg-user-count").text().trim();
      const description = $(el).find(".tg-channel-description").text().trim();
      const category = $(el).find(".tg-channel-categories a").text().trim();

      // 🎯 Biar link join jadi t.me
      if (link?.startsWith("/join/")) {
        link = await getRealTelegramLink(`https://en.tgramsearch.com${link}`);
      } else if (link?.startsWith("tg://resolve?domain=")) {
        const username = link.split("tg://resolve?domain=")[1];
        link = `https://t.me/${username}`;
      }

      results.push({ name, link, image, members, description, category });
    }

    if (results.length === 0) {
      console.log("Waduh cuks, nggak nemu channelnya 😭");
    }

    return results;
  } catch (err) {
    console.error(`💢 Error scraping nye cuks: ${err.message}`);
    return [];
  }
}

module.exports = { searchTelegramChannels };

/*
// 💡 Contoh pemakaian di CLI
searchTelegramChannels("janda").then(res => {
  res.forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.name}`);
    console.log(`   👥 Members   : ${item.members}`);
    console.log(`   🏷️ Category : ${item.category}`);
    console.log(`   📝 Deskripsi : ${item.description}`);
    console.log(`   🔗 Link      : ${item.link}`);
    console.log(`   🖼️ Foto      : ${item.image}`);
  });
});
*/
