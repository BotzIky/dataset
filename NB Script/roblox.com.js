/*
  base   : https://www.roblox.com/charts#/sortName/top-playing-now
  note   : kamu perlu install library sharp (buat combine thumbnail)
  url    : https://pastebin.com/HKZh7sc7 (save ajah link skrep nya, kalau skrep error biasanya aku update)
  by     : wolep
  update : 9 agustus 2025
*/

// pilih jalan ninjamu
//import sharp from "sharp"
//const sharp = require("sharp")

const r = {
    _misc: {
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


        log(logText) {
            if (this.debug) console.log(logText)
        },

        customMappingNumber (input) {
            const char = ['𝟢', '𝟣', '𝟤', '𝟥', '𝟦', '𝟧', '𝟨', '𝟩', '𝟪', '𝟫']
            return input.split("").map(v => isNaN(v) ? v : char[v]).join("")
        }
    },

    debug: false, // ganti false buat matikan log

    async getGameList(sortId = "top-playing-now") {
        // parama validation
        const validSortId = ["top-playing-now"]
        if (!validSortId.includes(sortId)) throw Error(`invalid sortId. sortId tersedia: ${validSortId.join(", ")}. Atau km kalau tau sort id yang valid lainnya bisa tuh di add di filter`)

        // hit #1
        const api1 = new URL(`https://apis.roblox.com`)
        api1.pathname = `explore-api/v1/get-sort-content`
        const usp = new URLSearchParams({
            "sessionId": "17996246-1290-440d-b789-d49484115b9a",
            "sortId": sortId,
            "cpuCores": "8",
            "maxResolution": "1920x1080",
            "maxMemory": "8192",
            "networkType": "4g"
        })
        api1.search = usp
        const { data: json1 } = await this._misc.hit(`top playing now`, api1, { method: 'get' }, `json`)
        const gameList = json1?.games?.slice(0, 10)
        if (!gameList?.length) throw Error(`lah gamelist nya kosong`)
        this._misc.log('hit api 1')

        // hit#2
        const payload = gameList.map(v => {
            const wolep = {
                "type": "GameIcon",
                "targetId": v.universeId,
                "format": "webp",
                "size": "256x256", // "256x256"
            }
            return wolep
        })
        const body = JSON.stringify(payload)
        const api2 = 'https://thumbnails.roblox.com/v1/batch'
        const { data: json2 } = await this._misc.hit(`batch download thumbnail`, api2, { body, 'method': 'post' }, `json`)
        const thumbnaliList = json2.data
        this._misc.log('hit api 2')

        // gabung value
        const result = gameList.map((v, i) => {
            const thumb = thumbnaliList[i]
            const wolep = { ...v, ...thumb }
            return wolep
        })

        return result
    },

    // bonus
    async serialize(gameListObject) {
        // download semua thumbnail sebagai buffer
        const imageFetchs = gameListObject.map(v => {
            const hit = this._misc.hit(`download gambar ${v.name}`, v.imageUrl, {}, 'buffer')
            return hit
        })
        const imageResults = await Promise.all(imageFetchs)
        const imageBuffers = imageResults.map(v => v.data)

        // gabungkan semua thumbnail menjadi 1 image besarrrrr
        const imageBuffer = await sharp(
            imageBuffers,
            {
                join: {
                    across: 5,        // kolom
                    shim: 10,         // jarak antar gambar (padding internal)
                    background: { r: 255, g: 255, b: 255, alpha: 1 } // warna padding
                }
            })
            .extend({ // padding global di luar grid
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toBuffer();

        // bikin caption
        const hider = `top 10 playing now games on roblox\n\n`
        const top10 = gameListObject.map((v, i) => {
            const wolep = (i + 1) + " | " + v.name + "\n" +
                "👥 player count " + this._misc.customMappingNumber(v.playerCount.toLocaleString("id-ID")) + "\n" +
                "👍 likes " + this._misc.customMappingNumber((v.totalUpVotes / (v.totalUpVotes + v.totalDownVotes) * 100).toFixed()) + "%\n" +
                "🎮 play now https://www.roblox.com/games/" + v.rootPlaceId
            return wolep
        }).join("\n\n")

        const caption = hider + top10
        const result = { imageBuffer, caption }
        return result
    },

    async cek() {
        const gameListObject = await this.getGameList()
        const result = await this.serialize(gameListObject)
        return result
    }
}

// cara pakai
r.cek()
    .then(console.log)
    .catch(console.log)

/* output
{
    imageBuffer: buffer isi thumbnail yang udh di gabung
    caption: caption game yang udh di gabung
}

kek gini
1 | [⏳] Grow a Garden 🌶️
👥 player count 𝟤.𝟣𝟥𝟢.𝟦𝟨𝟧
👍 likes 𝟫𝟥%
🎮 play now https://www.roblox.com/games/126884695634066

2 | [🦉] 99 Nights in the Forest 🔦
👥 player count 𝟣.𝟧𝟣𝟪.𝟦𝟢𝟣
👍 likes 𝟫𝟣%
🎮 play now https://www.roblox.com/games/79546208627805
*/