/* 
  cari kode post
  by wolep
  req by : muhammad ridwan 
  base : https://www.nomor.net
*/

const cariKodePost = async (namaDaerah) => {
    const r = await fetch("https://www.nomor.net/_kodepos.php?_i=cari-kodepos&jobs=" + encodeURIComponent(namaDaerah), {
        "headers": {
            "Referer": "https://www.nomor.net/",
            "accept-encoding": "gzip, deflate, br"
        },
        "method": "POST"
    })

    const d = await r.text()
    const m = d.matchAll(/class="ktw" title="(?:.+?)" rel="nofollow">(.+?)<\/a>/g)
    const a = Array.from(m)
    const e = a.map(a => a[1].replaceAll(/<\/?b>/g, '')).slice(0, 5)
    if (e.length !== 5) throw Error(`tidak di temukan hasil untuk pencarian kode post ${namaDaerah}`)
    const kodeWilayah = d.match(/class="ktw" rel="nofollow">(.+?)<\/a>/)?.[1]

    const result = {
        kodePost: e[0],
        desa: e[1],
        kecamatan: e[2],
        kabupaten: e[3],
        provinsi: e[4],
        kodeWilayah
    }
    return result
}

//cara pakai
cariKodePost("canggu bali")
.then(console.log)
.catch(e => {
    console.log("error " + e.message)
})

/* output
{
  kodePost: '80363',
  desa: 'Canggu',
  kecamatan: 'Kuta Utara',
  kabupaten: 'Badung',
  provinsi: 'Bali',
  kodeWilayah: '51.03.06.2005'
}*/