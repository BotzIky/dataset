const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");

async function pindl(link) {
    const form = new FormData();
    form.append("url", link);
const result = {
        status: 200,
        data: {
            creator: "Fruatre Maou",
            platform: "Pinterest",
            source: link,
            type: "video",
            video_url: ""
        }
    };
    await axios({
        url: "https://pinterestvideodownloader.com/download.php",
        method: "POST",
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": "_ga=GA1.2.431955486.1718265710; _gid=GA1.2.1691914427.1718265710",
            "Origin": "https://pinterestvideodownloader.com",
            "Referer": "https://pinterestvideodownloader.com/id/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        data: form
    }).then(({ data }) => {
        const $ = cheerio.load(data);
        let _$ = $("div.wrapper.clearfix > div#main.maxwidth.clearfix > main#content.content > center").eq(0);
        result.data.video_url = _$.find("div.col-sm-12 > video").attr("src");
    });

    return result;
}

// contohnya gini meng anu kan anunya
return pindl("https://id.pinterest.com/pin/575757133623547811/")

//response
*/ {
  status: 200,
  data: {
    creator: 'Fruatre Maou',
    platform: 'Pinterest',
    source: 'https://id.pinterest.com/pin/575757133623547811/',
    type: 'video',
    video_url: 'https://v1.pinimg.com/videos/mc/720p/f6/dc/cc/f6dccc1fbb68749a1c993e036ab95a0d.mp4'
  }
}
/*