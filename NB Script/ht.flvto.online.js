/*
    base   : https://ytmp4.is/
    update : 14 Juli 2025
    by     : wolep
    node   : v24.4.0
    fungsi : download audio / video youtube
    note   : video itag18, link download video kadang work kadang gk
             maksimal durasi audio dan video belum di ketahui
             tapi gw test video 24 jam bisa :v,
             audio 24 jam nya jg bisa cuman ada queue processing.
             tapi kalau musik / video common sih rasanya ok ok ajah.
             oh ya support ytmusic juga. masukin aja id nya
*/

const download = async (videoId, format = "mp3") => {
    const headers = {
        "accept-encoding": "gzip, deflate, br, zstd",
        "origin": "https://ht.flvto.online",
    }
    const body = JSON.stringify({
        "id": videoId,
        "fileType": format
    })
    const response = await fetch (`https://ht.flvto.online/converter`,{headers, body, method: "post"})
    if (!response.ok) throw Error (`${response.status} ${response.statusText}\n${await response.text()}`)
    const json = await response.json()
    return json
}

// cara pakai
// kalau lu perlu youtube search, bisa cek di : https://pastebin.com/9r3nQ8Bd

download("Ajxn0PKbv7I")
.then(console.log)
.catch(err => console.log(err.message))

/* output
{
  link: 'https://beta.123tokyo.xyz/get.php/0/da/Ajxn0PKbv7I.mp3?n=Green........N=ZHVieWE%3D',
  title: 'Green Day - Holiday (Official Audio)',
  filesize: 3871871,
  progress: 100,
  duration: 232.90775547348,
  status: 'ok',
  msg: 'success'
}
*/

/* atau bisa
download("Ajxn0PKbv7I") -> default download audio
download("Ajxn0PKbv7I", "mp3") -> sama kek diatas
download("Ajxn0PKbv7I", "mp4") -> untuk download mp4
*/

//More yrtdl skrep https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/355