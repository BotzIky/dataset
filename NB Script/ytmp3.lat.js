/*
  base    : https://ytmp3.lat/
  note    : bisa download audio/video maks 60 menit
            gw ada skrep yg bs pick resolusi video
            dan bitrate audio.. tapi rasis IP.. kadang 403
            coba aja di sini : https://pastebin.com/XCkhteBn
            kalau worek syukur, kalau gk worek jangan komplen ya owkowkw
  update  : 4 agustus 2025
  node    : v24.4.0
  by      : wolep
*/

const yt = {
    _tools: {
        genRandomHex: (length = 32) => {
            const charSet = '0123456789abcdef'
            return Array.from({ length }, _ => charSet.charAt(Math.floor(Math.random() * charSet.length))).join('')
        },
        enc1: (url) => url.split("").map(v => v.charCodeAt()).reverse().join(),
        enc2: (url) => url.split("").map(v => String.fromCharCode(v.charCodeAt() ^ 1)).join(''),
        validateString: (description, variable) => { if (typeof (variable) !== "string" || variable?.trim()?.length === 0) throw Error(`${description} harus string dan gak boleh kosong!`) },
        mintaJson: async function (description, url, fetchOptions) {
            try {
                const response = await fetch(url, fetchOptions)
                if (!response.ok) throw Error(`${response.status} ${response.statusText} ${(await response.text() || `(respond body kosong)`).substring(0, 150)}...`)
                const json = await response.json()
                return json
            } catch (error) {
                throw Error(`gagal minta json: ${description}\nerror: ${error.message}`)
            }
        },
    },
    get baseHeaders() {
        return {
            'content-type': 'application/json',
            'Referer': 'https://ytmp3.lat/',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        }
    },

    init: async function (ytUrl, format = 'mp3') {
        // validate string
        this._tools.validateString(`url youtube`, ytUrl)

        // validate format
        const formatList = {
            'mp3' : 0,
            'mp4' : 1
        }
        const selectedFormat = formatList?.[format]
        if (selectedFormat === undefined) throw Error (`invalid format, format tersedia: ${Object.keys(formatList).join(', ')}`)

        const encUrl = this._tools.enc1(ytUrl)
        const encPayload = this._tools.enc2(ytUrl)
        const hash1 = this._tools.genRandomHex()
        const hash2 = this._tools.genRandomHex()

        const url = `https://ytmp3.lat/${hash1}/init/${encUrl}/${hash2}/`
        const headers = {
            ... this.baseHeaders
        }
        const body = JSON.stringify({
            "data": encPayload,
            "format": selectedFormat + "", //0=audio, 1=video
        })
        const json = await this._tools.mintaJson(`init`, url, { headers, body, method: 'post' })
        json.format = format
        console.log(`init`)
        return json
    },

    cekStatus: async function (initObject) {
        // redirect
        let wolep = initObject
        let fetchCount = 1
        const MAX_FETCH_ATTEMPT = 60

        if (wolep?.s == 'C') {
            console.log('got directed')
            const url = this.createDownloadUrl(wolep)
            const title = initObject?.t || `(no name)`
            const format = initObject?.format
            const result = {url, title, format}
            return result
        } else {
            const hash1 = this._tools.genRandomHex()
            const hash2 = this._tools.genRandomHex()
            const { i } = wolep
            const headers = { ... this.baseHeaders }
            const url = `https://ytmp3.lat/${hash1}/status/${i}/${hash2}/`
            const body = JSON.stringify({
                data: i
            })

            do {
                wolep = await this._tools.mintaJson(`status`, url, { headers, body, 'method': 'post' })
                const print = `checking ke ${fetchCount} | ${wolep?.t || `(no name)`}`
                console.log(print)

                if (wolep.le) throw Error(`The video is longer than 30 minutes. Please select another video.`)
                if (wolep.e) throw Error(`There was an error in converting video. Please try again.`)
                if (wolep.i == 'invalid') throw Error(`Please enter a correct YouTube video URL.`)
                if (wolep.s == 'C') {
                    const url = this.createDownloadUrl(wolep)
                    const title = wolep.t || `(no name)`
                    const format = initObject.format
                    const result = {url, title, format}
                    return result
                }
                await new Promise(re => setTimeout(re, 3000))
                fetchCount++

            } while (wolep?.s == 'P' && fetchCount < MAX_FETCH_ATTEMPT)
            throw Error(`mencapai maksimal batas checking ${MAX_FETCH_ATTEMPT}`)
        }

    },

    createDownloadUrl: function (cekStatusObject) {
        const hash1 = this._tools.genRandomHex()
        const hash2 = this._tools.genRandomHex()
        const encTaskId = this._tools.enc2(cekStatusObject.i)
        const url = `https://ytmp3.lat/${hash1}/download/${encTaskId}/${hash2}/`
        return url

    },

    download: async function (youtubeUrl, format = 'mp3') {
        const initObject = await this.init(youtubeUrl, format)
        const result = await this.cekStatus(initObject)
        return result
    }
}

// cara pakai
const url = 'https://www.youtube.com/watch?v=HyHNuVaZJ-k&list=RDHyHNuVaZJ-k&start_radio=1'
yt.download(url, "mp3")
    .then(console.log)
    .catch(console.log)

/* atau
yt.download(url) -> audio
yt.download(url, 'mp3') -> audio
yt.download(url, 'mp4') -> video

/* output 
{
  url: 'https://ytmp3.lat/8f34385a9cc89c4fb9321788......d41709b89fa038561bdf8/',
  title: 'Gorillaz - Feel Good Inc. (Official Video)',
  format: 'mp3'
}
*/
