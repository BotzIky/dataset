/* name   : soundcloud track downloader
   base   : https://soundcloud.com/
   update : 7 agustus 2025
   node   : 24.5.0
   by     : wolep
*/

const sc = {
    _tools: {
        async hit(hitDescription, url, options, returnType = "text") {
            try {
                const response = await fetch(url, options)
                if (!response.ok) throw Error(`${response.status} ${response.statusText} ${(await response.text() || `(respond body kosong)`).substring(0, 100)}...`)
                try {

                    if (returnType === "text") {
                        const data = await response.text()
                        return { data, response }
                    } else if (returnType === "json") {
                        const data = await response.json()
                        return { data, response }
                    } else if (returnType == "buffer") {
                        const ab = await response.arrayBuffer()
                        const data = Buffer.from(ab)
                        return { data, response }
                    } else {
                        throw Error(`invalid param retunt type. pilih text/json`)
                    }
                } catch (error) {
                    throw Error(`gagal mengubah response menjadi ${returnType}\n${error.message}`)
                }
            } catch (error) {
                throw Error(`gagal hit. ${hitDescription}.\n${error.message}`)
            }
        },
        validateString: (description, variable) => { if (typeof (variable) !== "string" || variable?.trim()?.length === 0) throw Error(`${description} harus string dan gak boleh kosong!`) },
    },

    get baseHeaders() {
        return {
            'accept-encoding': 'gzip, deflate, br, zstd',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        }
    },

    async getTrackAuthAndStreamUrlAndKey(spotifyTrackUrl) {
        const headers = this.baseHeaders
        const { data: html } = await this._tools.hit(`homepage`, spotifyTrackUrl, { headers })
        const m_json = html?.match(/<script>window.__sc_hydration = (.+?);<\/script>/)?.[1]
        if (!m_json) throw Error(`fungsi download homepage fail. gak ada match untuk regex json`)
        const json = JSON.parse(m_json)

        const ddjsKey = html.match(/window\.ddjskey = '(.+?)';/)?.[1]
        const track_authorization = json?.[7]?.data?.track_authorization
        const stream_url = json?.[7]?.data?.media?.transcodings?.[3]?.url // here
        if (!ddjsKey || !track_authorization || !stream_url) throw Error('payload return gk lengkap! fungsi getTrackAuthAndStreamUrlAndKey gagal')

        // kosmetik    
        const title = json?.[7]?.data?.title || `no title`
        const image = html.match(/og:image" content="(.+?)">/)?.[1]
        const username = json?.[7]?.data?.user?.username
        const playbackCount = json?.[7]?.data?.playback_count || 0
        const likesCount = json?.[7]?.data.likes_count || 0
        const commentsCount = json?.[7]?.data.comment_count || 0
        const displayDate = json?.[7].data.display_date
        const soundMetadata = { title, image, username, playbackCount, likesCount, commentsCount, displayDate }
        const result = { ddjsKey, track_authorization, stream_url, soundMetadata }
        console.log('hit given url')
        return result
    },

    async getDatadome(gtaasuakObj) {
        const { ddjsKey } = gtaasuakObj
        const headers = {
            "Referer": "https://soundcloud.com/",
            ...this.baseHeaders
        }
        const body = new URLSearchParams({
            "ddk": ddjsKey,
        })
        const url = 'https://dwt.soundcloud.com/js/'
        const { data: json } = await this._tools.hit(`get datadome`, url, { headers, body, "method": "post" }, `json`)
        const value = json?.cookie?.split("; ")?.[0]?.split('=')?.[1]
        if (!value) throw Error(`hasil datadome kosong!`)
        console.log('got datadome')
        return { datadome: value }

    },

    async getClientId() {
        const headers = this.baseHeaders
        const url = 'https://a-v2.sndcdn.com/assets/0-b9979956.js'
        const { data: js } = await this._tools.hit(`mendapatkan client id`, url, { headers })
        const client_id = js.match(/"client_id=(.+?)"\)/)?.[1]
        if (!client_id) throw Error('match clien id kosong!')
        const result = { client_id }
        console.log('got client id')
        return result
    },

    async getHls(gtaasuakObj, gciObj, gddObj) {
        const { datadome, stream_url, client_id, track_authorization } = { ...gtaasuakObj, ...gciObj, ...gddObj }
        const headers = {
            "x-datadome-clientid": datadome,
            ...this.baseHeaders
        }
        const url = new URL(stream_url)
        url.search = new URLSearchParams({
            client_id,
            track_authorization
        })
        const { data: json } = await this._tools.hit(`mendapatkan hls`, url, { headers }, `json`)
        console.log('got hsl')
        return json
    },

    async download(soundcloudTrackUrl) {
        // validate input
        this._tools.validateString(`soundcloud track url`, soundcloudTrackUrl)
        const gtaasuakReq = await this.getTrackAuthAndStreamUrlAndKey(soundcloudTrackUrl)
        const gciReq = await this.getClientId()
        const [gtaasuakObj, gciObj] = await Promise.all([gtaasuakReq, gciReq])
        const gddObj = await this.getDatadome(gtaasuakObj)
        const ghObj = await this.getHls(gtaasuakObj, gciObj, gddObj)

        // susun result
        const { soundMetadata } = gtaasuakObj
        const { url } = ghObj
        const result = { ...soundMetadata, url }
        return result
    }
}

// cara pakai
sc.download("https://soundcloud.com/nocopyrightsounds/stars-ncs-release")
    .then(console.log)
    .catch(console.log)

/* output
{
   title: 'Diamond Eyes - Stars [NCS Release]',
  image: 'https://i1.sndcdn.com/artworks-000527427378-m040dc-t500x500.jpg',
  username: 'NCS',
  playbackCount: 888596,
  likesCount: 9816,
  commentsCount: 265,
  displayDate: '2019-05-01T16:15:09Z',
  url: 'https://cf-media.sndcdn.com/5Cn0GQ9bgHpx.128.mp3?Policy......K1iRraJegNWqdqsJZ5m-dbQnf8Xg__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ'
}
*/






/* nitip kodingan... boleh di hapus ini buat download download protokol hsl, rada ribet hehe maybe berguna suatu hari. hehe
    async getBuffer(hObj) {
        const { url } = hObj
        const headers = this.baseHeaders
        const { data: text } = await this._tools.hit(`mendapatkan m3u8`, url, { headers })
        const urls = text.match(/https:[^\n"]+/g)
        const kumpulanBuffer = []
        for (let i = 0; i < urls.length; i++) {
            const {data: newBuffer} = await this._tools.hit(`download url segmen ke ${i}`, urls[i], { headers }, 'buffer')
            const presentase = ((i+1)/urls.length* 100).toFixed(2) + "%"
            console.log(presentase)
            kumpulanBuffer.push(newBuffer)
        }
        return Buffer.concat(kumpulanBuffer)
    },
*/
