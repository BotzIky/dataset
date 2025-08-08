/*
    base   : https://dlpanda.com/id
    update : 23 juli 2025
    fungsi : buat download video dari facebook, x/twitter, pinterest, tiktok
    node   : v24.4.0
    note   : kalau error, hapus aja headers accept encoding yang zstd gw makek
             fetch bawaan node versi tertera. jadi support :v 
             ada banyak service yang masih bisa di skrep. cuma gw skrep yang
             common" ajah. bilang aja kalau mau di bikinin yang lainnya yah :v
    by     : wolep
    req by : orang, gatau lupa namanya :v
*/

class Dlpanda {
    origin = "https://dlpanda.com/id"
    webHeaders = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }

    getHtml = async (description, api, opts) => {
        try {
            const response = await fetch(api, opts);
            if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
            const html = await response.text()
            return html
        } catch (err) {
            throw Error(`gagal getHtml ${description} karena ${err.message}`)
        }
    }

    getCookieAndToken = async (path, regex) => {
        try {
            const url = this.origin + path
            const response = await fetch(url, {
                headers: this.webHeaders
            })
            const html = await response.text()
            const cookie = response.headers.getSetCookie().map(v => v.split(";")[0]).join("; ")
            const token = html.match(new RegExp(regex))?.[1] || null
            const result = { cookie, token }
            return result
        } catch (err) {
            throw Error(`gagal mendapatkan kuki dan tokenF\nkarena ${err.message}`)
        }
    }

    facebook = async (url) => {
       if (typeof (url) !== "string" || url?.trim()?.length === 0) throw Error(`miaw.. masukin url yang bener yah`)
        const { cookie, token } = await this.getCookieAndToken(`/facebook`, `_token" value="(.+?)"`)

        const headers = { cookie, ...this.headers }
        const body = new URLSearchParams({ url, _token: token })

        const api = new URL(this.origin)
        api.pathname = "/id/facebook"


        const html = await this.getHtml(`facebook`, api, { headers, body, method: "post" })

        // pick link
        const text = html.match(/" target="_blank"><h5>(.+?)<\/h5>/)?.[1] || `from facebook`
        let images = Array.from(html.matchAll(/img alt="" src="(.+?)"/gm))
        if (images.length) images = images.map(v => v[1])
        const audio = html.match(/downVideo\('([^ ]+)', '(?:.+?)mp3/)?.[1] || null
        let video =  html.match(/<source src="(.+?)"/)?.[1] || null
        if (video) video = video.replaceAll(`&amp;`,`&`)
        return {text, audio, video, images}             
    }

    twitter = async (url) => {
        if (typeof (url) !== "string" || url?.trim()?.length === 0) throw Error(`miaw.. masukin url yang bener yah`)
        const { cookie, token } = await this.getCookieAndToken(`/t`, `_token" value="(.+?)"`)
        const headers = { cookie, ...this.webHeaders }
        const body = new URLSearchParams({ url, _token: token })

        const api = new URL(this.origin)
        api.pathname = "/id/t"

        const html = await this.getHtml(`twitter`, api, {headers, body, "method":"post"})

        //pick link
        const text = html.match(/" target="_blank"><h5>(.+?)<\/h5>/)?.[1] || `from Pinterest`
        let images = Array.from(html.matchAll(/img alt="" src="(.+?)"/gm))
        if (images.length) images = images.map(v => v[1])
        const audio = html.match(/downVideo\('([^ ]+)', '(?:.+?)mp3/)?.[1] || null
        const video =  html.match(/<source src="(.+?)"/)?.[1] || null
        return {text, audio, video, images}
    }

    tiktok = async (url) => {
        if (typeof (url) !== "string" || url?.trim()?.length === 0) throw Error(`miaw.. masukin url yang bener yah`)
        const { cookie, token } = await this.getCookieAndToken(``, `id="token" value="(.+?)"`)
        const headers = { cookie, ...this.webHeaders }

        const api = new URL(this.origin)
        api.search = new URLSearchParams({ url, token })

        const html = await this.getHtml(`tiktok`, api, {headers})

        // pick link
        const text = html.match(/" target="_blank"><h5>(.+?)<\/h5>/)?.[1] || `from Tiktok`
        let images = Array.from(html.matchAll(/img alt="" src="(.+?)"/gm))
        if (images.length) images = images.map(v => v[1])
        const audio = html.match(/downVideo\('([^ ]+)', '(?:.+?)mp3/)?.[1] || null
        let video = html.match(/downVideo\('([^ ]+)', '(?:.+?)mp4/)?.[1] || null
        if (video) video = "https:" + video

        return {text, audio, video, images}

    }

    pinterest = async (url) => {
        if (typeof (url) !== "string" || url?.trim()?.length === 0) throw Error(`miaw.. masukin url yang bener yah`)    

        const headers = {...this.webHeaders}
        const api = new URL(this.origin)
        api.search = new URLSearchParams({ url })
        api.pathname = "id/pinterest"

        const html = await this.getHtml(`pinterst`, api, {headers})

        // pick link
        let text = html.match(/" target="_blank"><h5>(.+?)<\/h5>/)?.[1] || `from Pinterest`
        let images = Array.from(html.matchAll(/img alt="" src="(.+?)"/gm))
        if (images.length) images = images.map(v => v[1])
        const audio = html.match(/downVideo\('([^ ]+)', '(?:.+?)mp3/)?.[1] || null
        let video = html.match(/downloadFileHref\('(.+?)'\)/)?.[1] || null
        return {text, audio, video, images}
    }

    // tambah service lainnya, cuman males ku skrep, jarang di pakek jg wkw. patternnya kurang lebih sama, mungkin ku apdet lagi kode nya kalau perlu.
}



// cara pakai

(async() => {

    const delay = (ms) => new Promise(resolve => setTimeout(resolve,ms))

    // create new instance of Dlpanda
    const dlpanda = new Dlpanda()

    console.log("fb")
    const fb = await dlpanda.facebook("https://www.facebook.com/KallenNyanKaiNiZ/videos/furina-final-wish-neko-ni/602868228770382/")
    console.log(fb)

    await delay (2000)

    console.log("tiktok")
    const tiktok = await dlpanda.tiktok("https://www.tiktok.com/@factual.id/photo/7524111285127056648?lang=en")
    console.log(tiktok)

    await delay (2000)

    console.log("twitter")
    const twitter = await dlpanda.twitter("https://x.com/SpacePancakes/status/1790081529953096125")
    console.log(twitter)

    await delay (2000)

    console.log("pinterest")
    const pinterest = await dlpanda.pinterest("https://www.pinterest.com/pin/3659243440224609/")
    console.log(pinterest)
})()

/* output
{
  text: 'from facebook',
  audio: null,
  video: 'https://video.........65576',
  images: []
}
*/