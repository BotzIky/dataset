/*
  base   : https://www.craiyon.com/
  fungsi : buat nyari gambar ai generated
  by     : wolep
  node   : v24.4.0
  note   : result nya gw filter yg pro,
           dan gw random biar gk bosen :v
*/

const aiImageSearch = async function (search) {
    // validate param
    if (typeof (search) !== "string" || !search.trim().length) throw Error(`search harus string dan gak boleh kosong!`)

    // url
    const api = new URL(`https://api2.craiyon.com`)
    api.pathname = (`/search`)
    const searchParams = new URLSearchParams({
        "text": search,
        "max_results": "60" // dah cukup kayanya ini :v
    })
    api.search = searchParams

    // headers
    const headers = {
        "accept-encoding": "gzip, deflate, br, zstd",
        "cookie": "_ga=GA1.2.1185680231.1753717473;"

    }

    // hit
    const response = await fetch(api, { headers })
    if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
    let json = await response.json()

    // cek if images empty
    if (!json.images.length) throw Error(`tidak ada gambar dari pencarian ${search}`)

    // polish value ✨🌻

    // filter images pro only
    const proImages = json.images.filter(v => v.pro)
    if (proImages.length) {
        json.images = proImages
    } else {
        console.log(`gak ada gambar pro`)
    }

    // added origin for download url value
    const proImages_fixUrl = json.images.map(v => {
        const url = `https://media.craiyon.com`
        v.image_id = `${url}/${v.image_id}`
        return v
    })

    // shuffle the result with Fisher–Yates shuffle
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i >= 1; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    const proImages_fixUrl_shuffle = shuffleArray(proImages_fixUrl)

    json.images = proImages_fixUrl_shuffle
    return json
}

// cara pakai
aiImageSearch("neko anime camisole")
    .then(data => {
        // kalian serialize sendiri ya hehe, contoh output liat di bawah
        console.log(data)
    })
    .catch(error => {
        // handle error sesuka hati
        console.log(`gagal mencari gambar AI\n${error.message}`)
    })


/* output
{
  "images": [
    {
      "alt": "Girl with pink hair, cat ears, and black mask.",
      "ar": "1:1",
      "category": [
        "illustration",
        "girl",
        "digital art",
        "anime"
      ],
      "height": 1024,
      "id": "OmzphzIDRF6gsUc225DEmQ",
      "image_id": "https://media.craiyon.com/2025-04-19/QuhymYUATh220qlOFWoDcg.webp",
      "img_id": "2025-04-19/QuhymYUATh220qlOFWoDcg.webp",
      "negative_prompt": "",
      "pro": true,
      "prompt": "a girl with animal ears and a black mask",
      "style": "illustration",
      "watermark": true,
      "width": 1024
    }, 
    
    ..... (value lainnya)
    

*/