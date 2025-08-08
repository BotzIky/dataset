/*
  base    : https://www.pixelcut.ai/background-remover
  fungsi  : buat remove background
  note    : fetch dan form data menggunakan bawaan node js
            jadi gak perlu install dependency lagi
  node    : v24.20
  by      : wolep
  update  : 27 Juni 2025 - 03:40 WITA
*/

const removeBackground = async (imageBuffer) => {
    if (!Buffer.isBuffer(imageBuffer)) throw Error(`invalid buffer`)

    const body = new FormData()
    body.append("format", "png")
    body.append("model", "v1")
    body.append("image", new Blob([imageBuffer]))

    const headers = {
        "x-client-version": "web",
        ...body.headers
    }

    const response = await fetch("https://api2.pixelcut.app/image/matte/v1", {
        headers,
        body,
        "method": "post"
    })
    if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)

    const arrayBuffer = await response.arrayBuffer()
    const result = Buffer.from(arrayBuffer)
    return result
}

// cara pakai
const fs = require("fs")
const myBuff = fs.readFileSync("./image.jpg")

removeBackground(myBuff)
    .then(buffer => {
        // jadi dia return nya buffer ya, silakan di handle sendiri
        fs.writeFileSync("./result.png", buffer)
        console.log("berhasil remove background. cek file result.png")
    })
    .catch(error => console.log(error.message))
