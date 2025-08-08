/*
  base   : https://n9.cl/en
  node   : v24.4.0
  update : 4 agustus 2025
  fungsi : url shortener
  by     : wolep
*/

const shortUrl = async function (url) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
;
    const body = new URLSearchParams({
        'xjxfun' : 'create',
        'xjxargs[]' : 'S<![CDATA['+url+']]>'
    })

    const r = await fetch('https://n9.cl/en', {headers, body, 'method':'post'})
    if (!r.ok) throw Error (`${r.status} ${r.statusText}`)
    const t = await r.text()
    const u = t.match(/location = "(.+?)";/)?.[1]
    if (!u) throw Error (`gagal mendapatkan short url`)
    const fu = u.replace('/en/r','')
    return fu
}


// cara pakai
shortUrl('https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L')
.then(console.log)
.catch(console.log)

// output : https://n9.cl/dh63iw
