/*
  base   : https://9xbuddy.site/
  node   : v24.4.0
  update : 23 Juli 2025
  fungsi : buat download video youtube
  note   : skrep nya aku set hanya untuk download video mp4 yang ada suaranya
           yang di support sama situs nya. biar aku gk bingung. khusus yt aja :v
           untuk return value skrep nya itu sebuah objek. kamu hanya fokus ke
           filename dan buffer. iya di dalam objek nya ada buffer hasil download.
           🗣️ : kenapa gk link download aja bang?
           ya soal nya kalau link download terus lu pencet link nya ya bakalan
           403, mungkin karena beda headers
*/

const xbuddy = async (urlOrKeyword, chosenFormat = "360p", customId="") => {
    // common function
    const validateString = (yourParam) => { if (typeof (yourParam) !== "string" || yourParam?.trim()?.length === 0) throw Error(`invalid param type. must be string and cannot be empty`) }
    const sanitize = (string) => string.replace(/[^A-Za-z0-9 ]/g, '').replace(/ +/g, '_').toLowerCase()
    const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms))
    const reverseString = (string) => string.split("").reverse().join("")
    const randomIdentifier = (customId) =>{
        let id = customId?.toString()?.trim().length
        return id ? customId : parseInt(Math.random().toString().substring(2)).toString(32)
    }
    const hit = async (description, url, options, outputType = "text") => {
        try {
            const response = await fetch(url, options)
            if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
            let result = null
            try {
                if (outputType == "text") {
                    result = await response.text()
                } else if (outputType == "json") {
                    result = await response.json()
                } else if (outputType == "buffer") {
                    const ab = await response.arrayBuffer()
                    result = Buffer.from(ab)
                } else {
                    throw Error(`invalid output type`)
                }
                return result

            } catch (awo) {
                throw Error(`gagal mengubah hasil fetch menjadi ${outputType}\n${awo.message}`)
            }

        } catch (error) {
            throw Error(`hit gagal. ${description}\n${error.message}`)
        }
    }

    // validate input
    validateString(urlOrKeyword)
    const allFormats = ["144p", "240p", "360p", "480p", "720p", "1080p"]
    if (!allFormats.includes(chosenFormat)) throw Error(`invalid format. please pick one ${allFormats.join(", ")}`)

    // konstan
    const tools = {
        decode64(e) {
            if (e = e.replace(/\s/g, ""),
                /^[a-z0-9\+\/\s]+\={0,2}$/i.test(e) && !(e.length % 4 > 0)) {
                var t, r, n = 0, s = [];
                for (e = e.replace(/=/g, ""); n < e.length;) {
                    switch (t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(e.charAt(n)),
                    n % 4) {
                        case 1:
                            s.push(String.fromCharCode(r << 2 | t >> 4));
                            break;
                        case 2:
                            s.push(String.fromCharCode((15 & r) << 4 | t >> 2));
                            break;
                        case 3:
                            s.push(String.fromCharCode((3 & r) << 6 | t))
                    }
                    r = t,
                        n++
                }
                return s.join("")
            }
        },
        ord(e) {
            var t = "".concat(e)
                , r = t.charCodeAt(0);
            if (r >= 55296 && r <= 56319) {
                var n = r;
                return 1 === t.length ? r : 1024 * (n - 55296) + (t.charCodeAt(1) - 56320) + 65536
            }
            return r
        },
        encode64(e) {
            if (/([^\u0000-\u00ff])/.test(e))
                throw new Error("Can't base64 encode non-ASCII characters.");
            for (var t, r, n, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", a = 0, o = []; a < e.length;) {
                switch (t = e.charCodeAt(a),
                n = a % 3) {
                    case 0:
                        o.push(s.charAt(t >> 2));
                        break;
                    case 1:
                        o.push(s.charAt((3 & r) << 4 | t >> 4));
                        break;
                    case 2:
                        o.push(s.charAt((15 & r) << 2 | t >> 6)),
                            o.push(s.charAt(63 & t))
                }
                r = t,
                    a++
            }
            return 0 == n ? (o.push(s.charAt((3 & r) << 4)),
                o.push("==")) : 1 == n && (o.push(s.charAt((15 & r) << 2)),
                    o.push("=")),
                o.join("")
        },
        encrypt(e, t) {
            for (var r = "", n = 0; n < e.length; n++) {
                var s = e.substr(n, 1)
                    , a = t.substr(n % t.length - 1, 1);
                s = Math.floor(this.ord(s) + this.ord(a)),
                    r += s = String.fromCharCode(s)
            }
            return this.encode64(r)
        },
        decrypt(e, t) {
            var r = "";
            e = this.decode64(e);
            for (var n = 0; n < e.length; n++) {
                var s = e.substr(n, 1)
                    , a = t.substr(n % t.length - 1, 1);
                s = Math.floor(this.ord(s) - this.ord(a)),
                    r += s = String.fromCharCode(s)
            }
            return r
        },
        hex2bin(e) {
            var t, r = [], n = 0;
            for (t = (e += "").length; n < t; n += 2) {
                var s = parseInt(e.substr(n, 1), 16)
                    , a = parseInt(e.substr(n + 1, 1), 16);
                if (isNaN(s) || isNaN(a))
                    return !1;
                r.push(s << 4 | a)
            }
            return String.fromCharCode.apply(String, r)
        },

    }


    const myHeaders = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=UTF-8",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0",
        "x-requested-domain": "9xbuddy.site",
        "x-requested-with": "xmlhttprequest",
        "origin": "https://9xbuddy.site",
        "referer": "https://9xbuddy.site/",
    }

    // another function
    const getAuthToken = async (identifier) => {
        const taskName = `${identifier}-getAuthToken`
        console.time(taskName)
        const headers = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/json; charset=UTF-8",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0",
        }
        const url = "https://9xbuddy.site/"
        const html = await hit(`homepage`, url, { headers })

        const cssVersion = html.match(/main\.(.+?)\.css/)?.[1]
        if (!cssVersion) throw Error(`tidak bisa menemukan match match css version`)

        let json = html.match(/window.__INIT__ = (.+?)<\/script>/)?.[1]
        if (!json) throw Error(`tidak bisa menamukan match json`)

        if (json) json = JSON.parse(json)
        const ua = json?.ua
        if (!ua) throw Error(`gagal menemukan value ua`)

        const appVersion = json?.appVersion
        if (!appVersion) throw Error(`gagal menemukan value appVersion`)

        const hostname = new URL(url).hostname

        // mulai generate

        const satu = hostname //9xbuddy.site/
        const dua = reverseString(cssVersion) // ea6534dae7db17314ea0
        const tiga = reverseString(ua).substring(0, 10) // ,AjLw4CMug
        const empat = "SORRY_MATE_IM_NOT_GONNA_TELL_YOU"
        const lima = "xbuddy123sudo-" + appVersion // xbuddy123sudo-11.1.5
        const enam = appVersion // 11.1.5
        const payload = satu + dua + tiga + empat + lima + enam
        const authToken = tools.encrypt(payload, dua)

        const result = {
            cssVersion,
            ua,
            appVersion,
            hostname,
            authToken,
        }
        console.timeEnd(taskName)
        return result
    }

    const getAccessToken = async (authToken, identifier) => {
        const taskName = `${identifier}-getAccessToken`
        console.time(taskName)
        const headers = {
            "x-access-token": "false",
            "x-auth-token": authToken,
            ...myHeaders
        }
        const url = "https://ab1.9xbud.com/token"
        const json = await hit(`access token`, url, { headers, "method": "post" }, "json")
        const accessToken = json?.access_token
        if (!accessToken) throw Error(`access token kosong`)
        console.timeEnd(taskName)
        return { accessToken }
    }

    const generateSig = (keywordOrUrl, authToken) => {
        // create sig
        const plain = encodeURIComponent(keywordOrUrl)
        const key = authToken + "jv7g2_DAMNN_DUDE"
        const _sig = tools.encrypt(plain, key)
        return _sig
    }

    const extract = async (keywordOrUrl, authToken, accessToken, identifier) => {
        const taskName = `${identifier}-extract`
        console.time(taskName)
        const headers = {
            "x-access-token": accessToken,
            "x-auth-token": authToken,
            ...myHeaders
        }

        const body = JSON.stringify({
            _sig: generateSig(keywordOrUrl, authToken),
            url: encodeURIComponent(keywordOrUrl),
            searchEngine: "yt"
        })

        const url = "https://ab.9xbud.com/extract"

        const result = await hit(`extract`, url, { headers, body, "method": "post" }, "json")
        console.timeEnd(taskName)
        return result
    }

    const handleFormat = (extractObject, chosenFormat, hostname, cssVersion, identifier) => {
        const filtered = extractObject?.response?.formats?.filter(v => allFormats.includes(v.quality))
        if (!filtered) throw Error (`aneh.. tidak ada format apapun untuk di download`)
        const tokenUrl = extractObject.response.token

        let find
        for (let i = allFormats.indexOf(chosenFormat); i > -1; i--) {
            find = filtered.find(v => v.quality == allFormats[i])
            if (find) break
        }

        if (!find) throw Error(`format ada tapi gak ada yang audio+video combined.\nsilakan cek sendiri di https://${hostname}/process?url=${extractObject?.response?.request?.url || ""}`)
        if (allFormats.indexOf(chosenFormat) > allFormats.indexOf(find.quality)) console.log(`${identifier}-${chosenFormat} gak adaaaa. auto fallback ke yang ada ada aja. ${find.quality} ya.. hehe`)

        const url = find.url
        const cip = reverseString(tools.hex2bin(url))
        const key = `SORRY_MATE${hostname.length}${cssVersion}${tokenUrl}`
        find.url = tools.decrypt(cip, key)
        return find
    }

    const convert = async (selectedFormatObject, authToken, accessToken, identifier) => {
        const taskName = `${identifier}-convert`
        console.time(taskName)
        const headers = {
            "x-requested-domain": "9xbuddy.site",
            "x-requested-with": "xmlhttprequest",
            "origin": "https://9xbuddy.site",
            "referer": "https://9xbuddy.site/",
            "content-type": "application/json; charset=UTF-8",
            "x-access-token": accessToken,
            "x-auth-token": authToken,
            ...myHeaders
        }
        const uid = selectedFormatObject.url.split("/")[2]
        const url = selectedFormatObject.url.split("/")[3]
        const body = JSON.stringify({ uid, url })
        const api = "https://ab1.9xbud.com/convert"
        const result = await hit(taskName, api, { headers, body, "method": "post" }, "json")
        console.timeEnd(taskName)
        return result
    }
    const progress = async (convertObject, authToken, accessToken, identifier) => {
        const taskName = `${identifier}-progress`
        //console.time(taskName)
        const headers = {

            "x-access-token": accessToken,
            "x-auth-token": authToken,
            ...myHeaders
        }
        const uid = convertObject.url.split("/")[2]
        const body = JSON.stringify({ uid })
        const result = await hit(taskName, `https://ab1.9xbud.com/progress`, { headers, body, "method": "post" }, "json")
        //console.timeEnd(taskName)
        return result
    }
    const downloaderSakti = async (progressObject, authToken, accessToken, identifier) => {
        const taskName = `${identifier}-download`
        console.time(taskName)
        const headers = {
            "x-access-token": accessToken,
            "x-auth-token": authToken,
            ...myHeaders
        }
        const url = progressObject.response.url
        const buffer = await hit(taskName, url, { headers }, "buffer")
        console.timeEnd(taskName)
        return buffer
    }

    // main function
    const run = async (urlOrKeyword, chosenFormat, customId) => {

        let temp = {}

        // save custom identifier ke objek temp
        temp.identifier = randomIdentifier(customId)
        console.log(`[NEW TASK] ${temp.identifier}`)

        // mendapatkan value cssVersion, ua, appVersion, hostname, authToken dan save di temp object
        temp = { ...temp, ...await getAuthToken(temp.identifier) }

        // mendapatkan value accessToken, save di object temp object
        temp = { ...temp, ...await getAccessToken(temp.authToken, temp.identifier) }

        // ekstrak url, mendapatkan value dari server
        let extractObject = await extract(urlOrKeyword, temp.authToken, temp.accessToken, temp.identifier)
        const responseType = extractObject?.response?.type
        if (!responseType) throw Error(`tidak menemukan value response.type. anomali json return\n${JSON.stringify(extractObject, null, 2)}`)

        // kalau tipe nya search maka kita ambil response sever yang url video lalu feed url itu ke api extract
        if (responseType === "search") {
            const firstYoutubeUrl = extractObject.response.formats[0].pageAddress.trim()
            console.log(`${temp.identifier}-mencari url untuk ${urlOrKeyword}. dont worry its a fake delay 5 detik lol :v`)
            await delay(5000)
            console.log(`${temp.identifier}-pick ${firstYoutubeUrl}`)
            extractObject = await extract(firstYoutubeUrl, temp.authToken, temp.accessToken, temp.identifier)
        }

        // save some metadata
        temp.title = extractObject?.response?.title || `(no title)`
        temp.uploader = extractObject?.response?.uploader || `(no uploader)`

        // pick "best" selected format, jika vid hanya 240p dan kamu mau 1080p. maka akan fallback ke best format yaitu 240p
        const selectedFormatObject = handleFormat(extractObject, chosenFormat, temp.hostname, temp.cssVersion, temp.identifier)

        // simpan quality name ke temp object
        temp.quality = selectedFormatObject.quality

        // buat string filename
        const { title, uploader } = extractObject.response
        temp.fileName = sanitize(`${title} by ${uploader} ${selectedFormatObject.quality}`) + `.mp4`

        // convert, gua kagak tau jir ini value dari api nya kagak di apa apain wkkw
        const convertObject = await convert(selectedFormatObject, temp.authToken, temp.accessToken, temp.identifier)

        // cek progress dengan while luv <3
        const MAX_FETCH_ATTEMPT = 100
        let apiHit = 0
        let progressObject = {}

        console.time(`${temp.identifier}-cek progress`)
        do {
            apiHit++
            if (apiHit > MAX_FETCH_ATTEMPT) throw Error(`mencapai limit hit api ${MAX_FETCH_ATTEMPT} kali`)
            progressObject = await progress(selectedFormatObject, temp.authToken, temp.accessToken, temp.identifier)
            console.log(`${temp.identifier}-cek progress #${apiHit}`)
            if (progressObject?.status === 0) throw Error(`gagal mendownload video, kata situs nya : You seem to be offline or the request got blocked,\nini json lengkap nyah\n${JSON.stringify(progressObject, null, 2)}`)
            if (!progressObject?.response) await new Promise(re => setTimeout(re, 5000))
        } while (!progressObject.response)
        console.timeEnd(`${temp.identifier}-cek progress`)


        // simpan download url ke temp object
        temp.downloadUrl = progressObject.response.url

        // simpan ukuran video untuk kebutuhan metadata mendatang
        temp.videoSize = progressObject.response.size

        // download dan simpan buffer nya ke temp object
        console.log(`${temp.identifier}-sabar ya aku sedang mendownload videonya untuk mu... ${temp.videoSize}`)
        const buffer = await downloaderSakti(progressObject, temp.authToken, temp.accessToken, temp.identifier,)
        temp.buffer = buffer

        const wolep = {
            title : temp.title,
            uploader : temp.uploader,
            quality : temp.quality,
            fileName: temp.fileName,
            videoSize: temp.videoSize,
            buffer: temp.buffer
        }
        
        return wolep
    }
    return await run(urlOrKeyword, chosenFormat, customId)
}

// cara pakai
xbuddy("me at the zoo","1080p")
.then (data => {
    console.log(data)

    // handle pakai logika sendiri ya hehe
    const fs = require ("fs")
    fs.writeFileSync(`./${data.fileName}`, data.buffer)
    console.log(`file berhasil di simpan dengan nama ${data.fileName}`)})
.catch(err => {
    console.log(`task failed.\n${err.message}`)
})


/* output
{
  title: 'Me at the zoo',
  uploader: 'jawed',
  quality: '240p',
  fileName: 'me_at_the_zoo_by_jawed_240p.mp4',
  videoSize: '726.78 KB',
  buffer: <Buffer 00 00 00 20 66 74 79 70 69 73 6f 6d 00 00 02 00 69 73 6f 6d 69 73 6f 32 61 76 63 31 6d 70 34 31 00 00 00 08 66 72 65 65 00 0b 31 3e 6d 64 61 74 00 00 ... 744169 more bytes>
}
*/