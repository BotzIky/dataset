/*
    note   : kode baru penerus skrep ytmp3cc dkk.
             support yt biasa, yt short, yt music
             support video, audio < 90 menit
             support esm, cjs.
             domain bisa pakek ytmp3.cc/cx,
             atau ytmp3.as. auto redirect
             
    base   : https://ytmp3.as/
    node   : v24.4.0
    by     : wolep
    update : 27 Juli 2025
*/

"use strict" // < ini jangan di remove. bukan wm nanti error

const ytmp3 = {
    // fungsi helper
    getUrl() {
        return {
            base: "https://ytmp3.as/"
        }
    },
    getBaseHeaders: () => ({
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
    }),
    getRandomString: (name) => name?.trim()?.length ? name : parseInt(Math.random().toString().substring(2)).toString(36).substring(4),
    tryEval(description, input) {
        try {
            return eval(input)
        } catch (error) {
            throw Error(`fungsi tryEval gagal. description :${description}. error :${error.message}`)
        }
    },
    validateString: (description, theVariable) => {
        if (typeof (theVariable) !== "string" || theVariable?.trim()?.length === 0) {
            throw Error(`variabel ${description} harus string dan gak boleh kosong`)
        }
    },
    extractYotubeId: (url) => {
        let match
        try {
            if (url.includes("youtu.be")) {
                match = /\/([a-zA-Z0-9\-_]{11})/.exec(url);
            } else if (url.includes("youtube.com")) {
                if (url.includes("/shorts/")) {
                    match = /\/([a-zA-Z0-9\-_]{11})/.exec(url);
                } else {
                    match = /v=([a-zA-Z0-9\-_]{11})/.exec(url);
                }
            }
            return match?.[1]
        } catch (error) {
            throw Error(`url ${url} tidak di dukung`)
        }
    },
    async hit(description, url, options, returnType = "text") {
        try {
            let data
            const r = await fetch(url, options)
            if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text() || `(respond nya kosong)`}`)
            try {
                if (returnType == "text") {
                    data = await r.text()
                } else if (returnType == "json") {
                    data = await r.json()
                }
            } catch (error) {
                throw Error(`gagal mengubah response menjadi ${returnType}. ${error.message}`)
            }
            return { data, response: r }

        } catch (error) {
            throw Error(`fungsi hit gagal. description :${description}. error :${error.message}`)
        }
    },


    //  fungsi" utama
    async getAuth(identifier) {
        try {
            // fetch homepage
            const task1 = `${identifier} download homepage`
            console.time(`${task1}`)
            const headersHitHomepage = { ... this.getBaseHeaders() }
            const base = new URL (this.getUrl().base)
            const { data: homepageHTML, response: homepageResponse } = await this.hit(`download html homepage`, base.origin, { headersHitHomepage })
            const newHomepageUrl = new URL(homepageResponse.url)
            // logging kesamaan url
            if (base.origin != newHomepageUrl.origin){
                console.log(`${identifier} hmm.. kamu di redirect.. [${base.origin}] -> [${newHomepageUrl.origin}]`)
            }
            const code1 = homepageHTML.match(/<script>(.+?)<\/script>/)?.[1]
            if (!code1) throw Error(`tidak menemukan match untuk variabel di file html`)
            const jsPath = homepageHTML.match(/<script src="(.+?)" defer>/)?.[1]
            if (!jsPath) throw Error(`tidak menemukan match untuk variabel jsPath`)
            const jsUrl = newHomepageUrl.origin + jsPath
            console.timeEnd(`${task1}`)


            // fetch js file
            const task2 = `${identifier} download js file`
            console.time(task2)
            const headersHitJs = {
                referer: newHomepageUrl.href,
                ... this.getBaseHeaders()
            }
            delete headersHitJs.priority,
                delete headersHitJs["sec-fetch-user"],
                delete headersHitJs["upgrade-insecure-requests"]

            const { data: js } = await this.hit(`download js`, jsUrl, { headers: headersHitJs })

            // execute important function
            const sdh = js.match(/function decodeHex(.+?)return(:?.+?)}/g)?.[0]
            if (!sdh) throw Error(`tidak menemukan match untuk fungsi decodeHex`)
            const decodeHex = this.tryEval(`mendapatkan fungsi decodeHex`, `${sdh}decodeHex`)

            const sdb = js.match(/function decodeBin(.+?)return(:?.+?)}/g)?.[0]
            if (!sdb) throw Error(`tidak menemukan match untuk fungsi decodeBin`)
            const decodeBin = this.tryEval(`mendapatkan fungsi decodeBin`, `${sdb}decodeBin`)

            const sa = js.match(/function authorization(.+?)return(:?.+?)}}/g)?.[0]
            if (!sa) throw Error(`tidak menemukan match untuk fungsi autorhization`)
            const final = `${code1};${decodeBin};${decodeHex};${sa}authorization`
            const authorization = this.tryEval(`susun ciper html, susun fungsi decodeBin, dan mendapatkan fungsi authorization`, final)

            const sRootDomain = js.match(/gB=String.fromCharCode\((.+?)\)/)?.[0]
            if (!sRootDomain) throw Error(`tidak menemukan match root domain`)
            const gB = this.tryEval(`mendapatkan root domain`, `const ${sRootDomain};gB`)

            const sInitApi = js.match(/"GET","(.+?)\?/)?.[1]
            if (!sInitApi) throw Error(`tidak menemukan match init api`)
            const initUrl = this.tryEval(`mendapatkan init api`, `const gB="${gB}";"${sInitApi}"`)

            // susun return
            const authKey = decodeHex(this.tryEval(`mendapatkan authKey`, `${code1};gC.d(3)[1]`))
            const authValue = authorization()
            console.timeEnd(task2)
            return { authKey, authValue, initUrl, newHomepageUrl }
        } catch (error) {
            throw Error(`fungsi getAuth gagal. punya ${identifier}. pesan error: ${error.message}`)
        }

    },

    async init(identifier) {
        try {
            const task1 = `${identifier} hit init api`
            console.time(`${task1}`)
            const { authKey, authValue, initUrl, newHomepageUrl } = await this.getAuth(identifier)
            const baseUrl = newHomepageUrl
            const headers = {
                origin: baseUrl.origin,
                referer: baseUrl.href,
                ... this.getBaseHeaders()
            }
            delete headers["sec-fetch-user"],
                delete headers["upgrade-insecure-requests"]

            const api = new URL(initUrl)
            api.search = `${authKey}=${authValue}&_=${Math.random()}`
            const { data } = await this.hit(`init`, api, { headers }, "json")
            if (data.error != '0') throw Error(`ada error cuy... nih json nya\n${JSON.stringify(data, null, 2)}`)
            if (!data.convertURL) throw Error(`lah  convert url nya kosong. kocak ini mah`)
            console.timeEnd(`${task1}`)
            return { convertUrl: data.convertURL, newHomepageUrl }
        } catch (error) {
            throw Error(`fungsi init punya ${identifier} gagal. error: ${error.message}`)
        }
    },

    async convert(videoId, format, identifier) {
        try {
            const { convertUrl, newHomepageUrl } = await this.init(identifier)
            const task1 = `${identifier} hit convert url`
            console.time(task1)
            const url = new URL(convertUrl)
            url.searchParams.append("v", videoId)
            url.searchParams.append("f", format)
            url.searchParams.append("_", Math.random())

            const baseUrl = newHomepageUrl
            const headers = {
                connection: "keep-alive",
                host: url.hostname,
                origin: baseUrl.origin,
                referer: baseUrl.href,
                ... this.getBaseHeaders()
            }

            delete headers.priority
            delete headers["sec-fetch-user"]
            delete headers["upgrade-insecure-requests"]

            const { data: convert } = await this.hit(`convert`, url, { headers }, "json")
            //const { error, progressURL, downloadURL, redirectURL, redirect, title } = data
            if (convert.error != 0) throw Error(`ada error saat hit convert. nih respond nya ${JSON.stringify(redirect, null, 2)}`)
            console.timeEnd(task1)
            return { convert, newHomepageUrl }

        } catch (error) {
            throw Error(`fungsi convert gagal. identifier ${identifier}. error: ${error.message}`)
        }
    },

    async progress(videoId, format, identifier) {
        try {
            const { convert, newHomepageUrl } = await this.convert(videoId, format, identifier)
            const url = new URL(convert.progressURL || convert.redirectURL)
            const baseUrl = newHomepageUrl
            const headers = {
                connection: "keep-alive",
                host: url.hostname,
                origin: baseUrl.origin,
                referer: baseUrl.href,
                ... this.getBaseHeaders()
            }

            // jika ada redirect, langsung return reslult fetch link nya
            let result = {} // buat taruh downloadURL, title, format, identifier 
            if (convert.redirectURL) {
                const task = `${identifier} yey got redirect`
                console.time(task)
                const { data: redirect } = await this.hit(`redirect`, convert.redirectURL, { headers }, "json")
                if (redirect.error != 0) throw Error(`ada error cuy di result redirectURL. nih json raw nya\n${JSON.stringify(data, null, 2)}`)
                if (!redirect.downloadURL) throw Error(`lah kocak url download nya kosong di hasil get redirect URL`)
                const { downloadURL, title } = redirect
                result = {
                    identifier, title, format, downloadURL
                }
                console.timeEnd(task)
                return result // udah kelar disini :v
            } else {
                const task = `${identifier} cek progress`
                console.time(task)
                // kita mulai loop check
                const FETCH_INTERVAL = 5000 // 5 detik
                const FETCH_ATTEMPT = 36 // kalau di total ama di atas jadi 3 menitan
                let fetchCount = 0

                let progress = {}
                do {
                    fetchCount++
                    console.log(`${identifier} miaw.. #${fetchCount}`);
                    ({ data: progress } = await this.hit(`progress`, convert.progressURL, { headers }, "json"));
                    if (progress.progress == 3) {
                        // artinya udh lese ges.. kita bisa return
                        result = {
                            identifier,
                            title: progress.title,
                            format,
                            downloadURL: convert.downloadURL
                        }
                        console.timeEnd(task)
                        return result
                    }
                    if (progress.error != 0) throw Error(`ada error pas looping cek progress. pastiin durasi video nya kurang dari 90 menit. btw nih json error nya:\n${JSON.stringify(progress)}`)
                    //console.log(JSON.stringify(progress, null,2))
                    await new Promise(re => setTimeout(re, FETCH_INTERVAL))

                } while (fetchCount < FETCH_ATTEMPT && progress.progress != 3)
                throw Error(`mencapai max limit fetch attempt`)
            }
        } catch (error) {
            throw Error(`fungsi cekProgress error. identifier: ${identifier}. error: ${error.message}`)
        }
    },

    async download(url, format = "mp3", userIdentifier = null) {
        // validate param
        this.validateString(`url`, url)
        const validFormat = ["mp3", "mp4"]
        if (!validFormat.includes(format)) throw Error(`${format} invalid. valid formats are ${validFormat.join(", ")}`)

        // extract youtubeId
        const youtubeId = this.extractYotubeId(url)

        // handle identifier
        const identifier = this.getRandomString(userIdentifier)
        console.log(`[NEW TASK] ${identifier}`)

        // actual hit
        const result = await this.progress(youtubeId, format, identifier)
        return result
    }

}

// cara pakai
ytmp3.download(`https://www.youtube.com/watch?v=k1BFHYtZlAU&list=RDrn_YodiJO6k&index=18`)
    .then(console.log)
    .catch(error => {
        console.log(error)
    })

/* atau
ytmp3.download(URL, "mp4") -> untuk download video
ytmp3.download(URL, "mp3") -> untuk download audio
ytmp3.download(URL) -> untuk download audio juga

/* output
{
  identifier: 'xl7mlpk',
  title: 'blink-182 - Stay Together For The Kids',
  format: 'mp3',
  downloadURL: 'https://numn.ummn.nu/api/v1/download?sig=sk1OSvZxFdR6GwyRGbbXZH2PvlD.......NqcHRGf7tdtxvyeezA4RjzA%3D%3D'
}
*/