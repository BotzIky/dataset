/*
  nama   : qr
  fungsi : buat generate qr, baca qr dari file/buffer
  base   : https://goqr.me/
  update : 10 Juli 2025
  node   : v24.2.0
  by     : wolep
  note   : bukan skrep.. kalian bisa baca dokumentasinya di
           https://goqr.me/api/doc/
           funtsi readFromUrl nya error. gtw gw,
           gw coba dari example nya jg error.
           sisanya worek as expected
           support dev base nyah :
           https://buy-me-a.coffee/paypal/coffee-donation-goQR.me/

*/


qr = {
  readFromBuffer: async (imageBuffer) => {
    if (!Buffer.isBuffer(imageBuffer)) throw Error(`invalid buffer input`)
    const file = new File([imageBuffer], "file", { type: "file" })

    const body = new FormData()
    body.append("file", file)

    const headers = {
      ...body.headers
    }

    const response = await fetch("http://api.qrserver.com/v1/read-qr-code/", {
      body,
      headers,
      method: "post"
    })

    if (!response.ok) throw Error(`${response.statusText} ${response.status}\n${await response.text()}`)

    const json = await response.json()
    const data = json?.[0]?.symbol?.[0]?.data
    if (!data) throw Error(`request ok tapi hasil agak anomali. nih jsonnya\n${JSON.stringify(json, null, 2)}`)
    return data
  },
  readFromUrl: async (url) => {
    let imageUrl = url
    try {
      imageUrl = new URL(url).toString()
    } catch (e) {
      throw Error(`miaw... url is invalid or url cannot be empty`)
    }

    const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(imageUrl)}`)
    if (!response.ok) throw Error(`${response.statusText} ${response.status}\n${await response.text()}`)

    const json = await response.json()
    const data = json?.[0]?.symbol?.[0]?.data
    if (!data) throw Error(`request ok tapi hasil agak anomali. nih jsonnya\n${JSON.stringify(json, null, 2)}`)
    return data

  },
  create: async (text) => {
    if (typeof (text) !== "string" || text?.length === 0) throw Error(`input text is invalid string or cannot be empty`)
    const response = await fetch(`http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=1000x1000&margin=50&qzone=1`)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return buffer
  }
}

// cara pakai (fungsi create)

/*
const fs = require("fs")
const outputPath = "./qr-result.png"
qr.create("hai semuanya ini wolep")
  .then(buff => {
    fs.writeFileSync(outputPath, buff)
    console.log(`qr berhasil di buat. lihat di ${outputPath}`)
  })
  .catch(e => console.log(e.message))

output : 1 file qr
*/


// cara pakai (fungsi readFromBuffer)

/*
const fs = require("fs")
const yourQrBuff = fs.readFileSync("./qr.png")
qr.readFromBuffer(yourQrBuff)
.then(console.log)
.catch(err => console.log(err.message))

output : "hai aku wolep"
*/



