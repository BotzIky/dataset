/*
  base   : https://spotisongdownloader.to/
  fungsi : download spotify track/lagu
  update : 11 agustus 2025
  url    : https://pastebin.com/zJ5C9rAV
  by wolep
*/

const s = {
    tools: {
        async hit(description, url, options, returnType = "text") {
            try {
                const response = await fetch(url, options)
                if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text() || `(response body kosong)`}`)
                try {
                    if (returnType == "text") {
                        const data = await response.text()
                        return { data, response }
                    } else if (returnType == "json") {
                        const data = await response.json()
                        return { data, response }
                    } else {
                        throw Error(`invalid returnType param.`)
                    }
                } catch (e) {
                    throw Error(`gagal mengubah return type menjadi ${returnType}. ${e.message}`)
                }
            } catch (e) {
                throw Error(`hit ${description} failed. ${e.message}`)
            }
        }
    },

    get baseUrl() {
        return "https://spotisongdownloader.to"
    },
    get baseHeaders() {
        return {
            "accept-encoding": "gzip, deflate, br, zstd",
            "user-agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0"
        }
    },

    // this function is to get cookie from homepage
    async getCookie() {
        const url = this.baseUrl
        const headers = this.baseHeaders
        const { response } = await this.tools.hit(`homepage`, url, { headers })
        let cookie = response?.headers?.getSetCookie()?.[0]?.split("; ")?.[0]
        if (!cookie?.length) throw Error(`gagal mendapatkan kuki`)
        cookie += "; _ga=GA1.1.2675401.1754827078"
        console.log(`hit ${url}`)
        return { cookie }
    },

    // this function is to register obtained cookie just like cookie validation
    async ifCaptcha(gcObject) {
        const pathname = '/ifCaptcha.php'
        const url = new URL(pathname, this.baseUrl)
        const headers = {
            "referer": new URL(this.baseUrl).href,
            ... gcObject,
            ... this.baseHeaders
        }
        const { data } = await this.tools.hit(`ifCaptcha`, url, { headers })
        console.log(`hit ${pathname}`)
        return headers
    },

    // this function is to retrive single track information/metadata
    async singleTrack(spotifyTrackUrl, icObject) {
        const pathname = '/api/composer/spotify/xsingle_track.php'
        const url = new URL(pathname, this.baseUrl)
        url.search = new URLSearchParams({
            url: spotifyTrackUrl
        })
        const headers = icObject
        const { data } = await this.tools.hit(`single track`, url, { headers }, 'json')
        console.log(`hit ${pathname}`)
        return data
    },

    //you need to this this api first to gain acces to next request
    async singleTrackHtml(stObject, icObj) {
        const payload = []
        
        payload.push(stObject.song_name)
        payload.push(stObject.duration)
        payload.push(stObject.img)
        payload.push(stObject.artist)
        payload.push(stObject.url)
        payload.push(stObject.album_name)
        payload.push(stObject.released)

        const pathname = '/track.php'
        const url = new URL(pathname, this.baseUrl)
        const headers = icObj
        const body = new URLSearchParams({
            data: JSON.stringify(payload)
        })
        const { data } = await this.tools.hit(`track html`, url, { headers, body, method: 'post' })
        console.log(`hit ${pathname}`)
        return data
    },

    //actual hit to get download url
    async downloadUrl(spotifyTrackUrl, icObj, stObj) {
        const pathname = '/api/composer/spotify/ssdw23456ytrfds.php'
        const url = new URL(pathname, this.baseUrl)
        const headers = icObj
        const body = new URLSearchParams({
            "song_name": "",
            "artist_name": "",
            "url": spotifyTrackUrl,
            "zip_download": "false",
            "quality": "m4a"
        })
        const { data } = await this.tools.hit(`get download url`, url, { headers, body, method: 'post' }, 'json')
        const result = {...data, ...stObj}
        console.log(`hit ${pathname}`)
        return result
    },

    async download(spotifyTrackUrl) {
        // validate spotify url (bikin sendiri ya haha)
        const gcObj = await this.getCookie()
        const icObj = await this.ifCaptcha(gcObj)
        const stObj = await this.singleTrack(spotifyTrackUrl, icObj)
        const sthObj = await this.singleTrackHtml(stObj,icObj)
        const dlObj = await this.downloadUrl(spotifyTrackUrl, icObj, stObj)
        return dlObj
    }
}

// cara pakai
s.download("https://open.spotify.com/track/1ibeKVCiXORhvUpMmtsQWq")
    .then(console.log)
    .catch(console.log)

/* output
{
  dlink: 'https://awd4.mymp3.xyz/phmp3?fname=926-805.m4a',
  status: 'success',
  comments: 'success',
  cookie: '/root/django/scookies/c1.txt',
  song_name: 'Pieces',
  artist: 'Sum 41',
  img: 'https://i.scdn.co/image/ab67616d0000b273cb38dd3dba8a0801bc1ee03a',
  duration: '3m 0s',
  res: 200,
  url: 'https://open.spotify.com/track/1ibeKVCiXORhvUpMmtsQWq',
  released: '2004-10-12',
  album_name: 'Chuck'
}
  */