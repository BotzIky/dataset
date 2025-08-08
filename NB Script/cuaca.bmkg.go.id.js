/*
    base   : https://cuaca.bmkg.go.id/ (provider cuaca & provider koordinat backup)
             https://www.google.com/maps/ (provider koordinat)
             https://www.gps-coordinates.net/ (provider koordinat backup)
    fungsi : buat cek cuaca terbaru
    note   : search locationnya aku pakai google maps, enak, gak kaku search
             nya.. cobain aja hehe. skrep bisa search by query atau input
             koordinat langsung. cek cara pakai di bawah ya!
             sorry yak kalau kadang anomali result. wkwk.
    node   : v24.4.0
    update : 30 juli 2025
    by     : wolep
           
*/
const cuaca = {
    get url() {
        return {
            api_search_geo: `https://cuaca.bmkg.go.id/api/df/v1/adm/search`,
            api_search_geo_2: `https://www.gps-coordinates.net/geoproxy`,
            api_cuaca: `https://weather.bmkg.go.id/api/presentwx/coord`,
            api_cuaca_warning: `https://cuaca.bmkg.go.id/api/v1/public/weather/warning`,
        }
    },

    get string() {
        return {
            gps: '9416bf2c8b1d4751be6a9a9e94ea85ca',
            bmkg: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFjNWFkZWUxYzY5MzM0NjY2N2EzZWM0MWRlMjBmZWZhNDcxOTNjYzcyZDgwMGRiN2ZmZmFlMWVhYjcxZGYyYjQiLCJpYXQiOjE3MDE1ODMzNzl9.D1VNpMoTUVFOUuQW0y2vSjttZwj0sKBX33KyrkaRMcQ'
        }
    },

    get baseHeaders() {
        return {
            'accept-encoding': 'gzip, deflate, br, zstd',
        }
    },

    validateCoordinate: function (what, input, startLimit, endLimit) {
        let lat = parseFloat(input)
        if (isNaN(lat) || !(lat >= startLimit && lat <= endLimit)) throw Error(`${what}`)
    },

    validasiString: function (deskripsi, variabel) {
        if (typeof (variabel) !== "string" || !variabel?.toString()?.trim().length) throw Error(`param ${deskripsi} harus string/number dan gak boleh kosong!`)
    },

    mintaJson: async function (description, url, fetchOptions) {
        try {
            const response = await fetch(url, fetchOptions)
            if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
            const json = await response.json()
            return json
        } catch (error) {
            throw Error(`gagal minta json: ${description}\nerror: ${error.message}`)
        }
    },

    cariKoordinat: async function (lokasiKamu) {
        "use strict"
        this.validasiString(`lokasi`, lokasiKamu)
        const new_url = new URL(`https://www.google.com/s`)
        new_url.search = new URLSearchParams({
            "tbm": "map",
            "gs_ri": "maps",
            "suggest": "p",
            "authuser": "0",
            "hl": "en",
            "gl": "id",
            "psi": "2OKJaLzkJKOe4-EPttbSoQQ.1753866977195.1",
            "q": lokasiKamu,
            "ech": "22",
            "pb": "!2i22!4m12!1m3!1d130622.22!2d22.22!3d-22.22!2m3!1f0!2f0!3f0!3m2!1i477!2i636!4f13.1!7i20!10b1!12m24!1m5!18b1!30b1!31m1!1b1!34e1!2m3!5m1!6e2!20e3!10b1"+
            "!12b1!13b1!16b1!17m1!3e1!20m4!5e2!6b1!8b1!14b1!46m1!1b0!96b1!19m4!2m3!1i360!2i120!4i8!20m57!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m33"+
            "!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!15m8!1m7!1m2!1m1!1e2"+
            "!2m2!1i195!2i195!3i20!22m3!1s2OKJaLzkJKOe4-EPttbSoQQ!7e81!17s2OKJaLzkJKOe4-EPttbSoQQ:79!23m2!4b1!10b1!24m112!1m32!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1!18m21"+
            "!3b1!4b1!5b1!6b1!9b1!12b1!13b1!14b1!17b1!20b1!21b1!22b1!25b1!27m1!1b0!28b0!32b1!33m1!1b1!34b1!36e2!10m1!8e3!11m1!3e1!14m1!3b0!17b1!20m2!1e3!1e6!24b1!25b1!26b1!27b1"+
            "!29b1!30m1!2b1!36b1!37b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1!56m1!1b1!61m2!1m1!1e1!65m5!3m4!1m3!1m2!1i224!2i298!72m22!1m8!2b1!5b1!7b1!12m4!1b1!2b1!4m1!1e1!4b1!8m10"+
            "!1m6!4m1!1e1!4m1!1e3!4m1!1e4!3sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts!6m1!1e1!9b1!89b1!98m3!1b1!2b1!3b1!103b1!113b1!114m3!1b1!2m1!1b1!117b1"+
            "!122m1!1b1!125b0!126b1!127b1!26m4!2m3!1i80!2i92!4i8!34m19!2b1!3b1!4b1!6b1!8m6!1b1!3b1!4b1!5b1!6b1!7b1!9b1!12b1!14b1!20b1!23b1!25b1!26b1!31b1!37m1!1e81!47m0!49m10!3b1!6m2!1b1!2b1!7m2!1e3!2b1!8b1!9b1!10e2!61b1!67m5!7b1!10b1!14b1!15m1!1b0!69i742"
        })
        const response = await fetch(new_url, {headers : this.baseHeaders})
        if (!response.ok) throw Error (`${response.status} ${response.statusText}. google maps not ok!`)
        const data = await response.text()
        const hasil = data.split("\n")[1].trim()
        const ar = eval(hasil)
        //console.log(JSON.stringify(ar, null, 2))

        const flatArray = [...new Set(ar.flat(7).filter(v => v))]
        const dumpKoordinat = flatArray.filter(v => typeof (v) != "string" && !Number.isInteger(v))
        const latitude = dumpKoordinat[0]
        const longitude = dumpKoordinat[1]
        const dumpPlace = flatArray.filter(v => typeof (v) === "string")
        const placeName = dumpPlace[1].split(", ")[0]
        const result = { placeName, latitude, longitude }
        //console.log(result)
        if (!longitude || !latitude) throw Error(`gagal mendapatkan koordinat ${lokasiKamu}`)
        return result
    },


    getkWeatherByCoordinateBMKG: async function (latitude, longitude, placeName = "") {
        // validasi koordinate dirty validate lol :v
        try {
            this.validateCoordinate(`latitude`, latitude, -12, 7)
            this.validateCoordinate(`longitude`, longitude, 93, 142)
        } catch (error) {
            throw Error("aduh... gak ada data cuaca... " + error.message + "nya kejauhan wkwk")
        }

        // padding end
        const padEnd = 0

        const namaTempat = placeName.trim().length ? "📌 nama: ".padEnd(padEnd) + placeName + '\n' : ''

        // payload api cuaca
        const cuacaHeaders = { ...this.headers }
        const cuacaApi = new URL(this.url.api_cuaca)
        const cuacaQs = {
            lon: longitude,
            lat: latitude
        }
        cuacaApi.search = new URLSearchParams(cuacaQs)

        // payload api cuaca warning
        const cuacaWarningApi = new URL(this.url.api_cuaca_warning)
        const cuacaWarningQs = {
            lat: latitude,
            long: longitude
        }
        cuacaWarningApi.search = new URLSearchParams(cuacaWarningQs)
        const cuacaWarningHeaders = {
            'X-api-key': this.string.bmkg,
            ... this.baseHeaders
        }

        // jalankan request pararel
        const allRequest = [
            this.mintaJson(`cuaca`, cuacaApi, { headers: cuacaHeaders }),
            this.mintaJson(`cuaca warning`, cuacaWarningApi, { headers: cuacaWarningHeaders })

        ]
        const [cuacaJson, cuacaWarningJson] = await Promise.all(allRequest)

        // rapikan data cuaca
        const { provinsi, kotkab, kecamatan, desa, adm4 } = cuacaJson.data.lokasi
        const lokasi = `${desa}, ${kecamatan}, ${kotkab}, ${provinsi}`

        const { weather, weather_desc, weather_desc_en, image, datetime, local_datetime, t, tcc, wd_deg, wd, wd_to, ws, hu, vs, vs_text } = cuacaJson.data.cuaca
        const arahAngin = { N: 'utara', NE: "timur laut", E: 'timur', SE: 'tenggara', S: 'selatan', SW: 'barat daya', W: 'barat', NW: 'barat laut' }
        const angin = `angin bertiup dari ${arahAngin[wd]} ke ${arahAngin[wd_to]} dengan kecepatan ${ws} km/jam. sudut arah ${wd_deg}°`
        
        const cuaca = "📍 lokasi: ".padEnd(padEnd) + lokasi + "\n" +
            "🕒 waktu: ".padEnd(padEnd) + local_datetime.split(" ")[1] + " (waktu setempat)\n" +
            "🌄 cuaca: ".padEnd(padEnd) + weather_desc + "/" + weather_desc_en + "\n" +
            "🔥 suhu: ".padEnd(padEnd) + t + "°C\n" +
            "💧 kelembapan: ".padEnd(padEnd) + hu + "%\n" +
            "🌁 tutupan awan: ".padEnd(padEnd) + tcc + "%\n" +
            "👓 jarak pandang: ".padEnd(padEnd) + vs_text + " (" + vs + " m)" + "\n" +
            "💨 angin: ".padEnd(padEnd) + angin
        //console.log(cuaca)

        let dampak = cuacaWarningJson.data?.today?.kategoridampak
        const peringatan = cuacaWarningJson.data?.today?.description?.description?.trim() || `(tidak ada)`
        dampak = dampak ? JSON.parse(dampak.replaceAll(`'`, `"`))?.join(", ") : `(tidak ada)`
        const cuacaWarning = "😱 dampak: ".padEnd(padEnd) + dampak + "\n" +
            "🚨 peringatan: ".padEnd(padEnd) + peringatan

        // buat url google maps dan bmkg
        const bmkgUrl = "🔗 bmkg: ".padEnd(padEnd) + `https://www.bmkg.go.id/cuaca/prakiraan-cuaca/${adm4}`
        const gmapUrl = "🔗 google map: ".padEnd(padEnd) + `https://www.google.com/maps?q=${latitude},${longitude}`


        const final = namaTempat + cuaca + '\n\n' + cuacaWarning + '\n\n' + bmkgUrl + '\n' +gmapUrl
        return final
    },

    run: async function (lokasiKamu) {
        const wolep = await this.cariKoordinat(lokasiKamu)
        const { latitude, longitude, placeName } = wolep
        const result = await this.getkWeatherByCoordinateBMKG(latitude, longitude, placeName)
        return result
    }
}


cuaca.run("patung bali gwk")
    .then(console.log)
    .catch(error => {
        // handle error sesuka hati ya seperti biasa
        // tinggal m.reply hehe
        console.log(error.message)
    })

/* atauuu.. cari dengan koordinat
   cuaca.getkWeatherByCoordinateBMKG(latitude, longitude, OPSIONAL_NAMA_TEMPAT)
*/

/* putput
📌 nama: Patung Garuda Wisnu Kencana
📍 lokasi: Ungasan, Kuta Selatan, Badung, Bali
🕒 waktu: 21:50:00 (waktu setempat)
🌄 cuaca: Berawan Tebal/Overcast
🔥 suhu: 27°C
💧 kelembapan: 78%
🌁 tutupan awan: 100%
👓 jarak pandang: > 10 km (10015 m)
💨 angin: angin bertiup dari timur ke barat dengan kecepatan 24.5 km/jam. sudut arah 135°

😱 dampak: HujanSedang-Lebat
🚨 peringatan: UPDATE Peringatan Dini Cuaca Wilayah Bali tgl 30 Juli 2025 pkl. 21:00 WITA berpotensi terjadi hujan dengan intensitas sedang hingga lebat pada pkl 21:15 WITA. Kondisi ini diperkirakan masih dapat berlangsung hingga pkl 23:30 WITA

Prakirawan BMKG - Bali
https://nowcasting.bmkg.go.id

🔗 bmkg: https://www.bmkg.go.id/cuaca/prakiraan-cuaca/51.03.05.2002
🔗 google map: https://www.google.com/maps?q=-8.814113599999999,115.166614
*/



// backup pencari koordinat

/* kamu bisa makek search engine nya bmkg, cuma menurut aku kurang fleksibel :v, bisa pakai ini kalau punya google gagal
getCoordinatebyBMKG: async function (lokasiKamu) {
    this.validasiString(`lokasi`, lokasiKamu)
    const searchParam = new URLSearchParams({
        keyword: lokasiKamu
    })
    const api = new URL(this.url.api_search_geo)
    api.search = searchParam
    const lokasiJson = await this.mintaJson(`cek lokasi`, api, { headers: this.baseHeaders })
    if (!lokasiJson.length) throw Error(`hasil search geo location dengan keyword ${lokasiKamu} return nothing!`)
    return lokasiJson
},
*/

/* ini juga ada backupan nya
    resolveCoordinate: async function (lokasiKamu) {
    this.validasiString(`lokasi`, lokasiKamu)
    const api = new URL(this.url.api_search_geo_2)
    api.search = new URLSearchParams({
        "q": lokasiKamu,
        "key": this.string.gps,
        "no_annotations": "1",
        "language": "id"
    })

    const headers = { ...this.baseHeaders }
    const json = await this.mintaJson(`cari koordinat`, api, { headers })
    const hasilPertama = json.results?.[0]
    if (!hasilPertama) throw Error(`tidak menemukan hasil koordinat ${lokasiKamu}`)
    const place_name = hasilPertama?.formatted || `tanpa nama`
    const latitude = hasilPertama?.geometry.lat
    const longitude = hasilPertama?.geometry?.lng
    return { place_name, longitude, latitude }
}
*/
