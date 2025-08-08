const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const cheerio = require('cheerio');
const fs = require('fs'); // Diperlukan untuk membaca file dari path

/**
 * Mengunggah gambar ke PostImages dan mengembalikan URL langsungnya.
 * @param {Buffer|string} bufferOrPath Buffer gambar atau path (string) ke file gambar.
 * @param {string} [filename] Nama file opsional. Jika tidak disediakan dan inputnya adalah path, nama file akan diambil dari path.
 * @returns {Promise<{url: string}>} Sebuah objek yang berisi URL gambar final.
 */
module.exports = async function(bufferOrPath, filename) {
  let buffer;
  let finalFilename = filename;

  // Cek apakah input adalah Buffer atau path file (string)
  if (Buffer.isBuffer(bufferOrPath)) {
    buffer = bufferOrPath;
    if (!finalFilename) {
      finalFilename = 'image.jpg'; // Nama default jika tidak ada yg diberikan untuk buffer
    }
  } else if (typeof bufferOrPath === 'string') {
    // Jika string, anggap itu adalah path file
    try {
      if (!fs.existsSync(bufferOrPath)) {
        throw new Error(`File tidak ditemukan di path: ${bufferOrPath}`);
      }
      buffer = fs.readFileSync(bufferOrPath);
      if (!finalFilename) {
        finalFilename = path.basename(bufferOrPath); // Ambil nama file dari path
      }
    } catch (err) {
      throw new Error(`Gagal membaca file dari path: ${err.message}`);
    }
  } else {
    throw new Error('Input tidak valid. Harap berikan Buffer atau path file (string).');
  }

  // ==========================================================
  // LOGIKA INTI SCRAPING 
  // ==========================================================
  const form = new FormData();
  const uploadSession = `${new Date().getTime()}${Math.random().toString().substring(1)}`;
  const uploadReferer = Buffer.from('https://postimages.org/').toString('base64');

  form.append('upload_session', uploadSession);
  form.append('upload_referer', uploadReferer);
  form.append('numfiles', '1');
  form.append('gallery', '');
  form.append('optsize', '0');
  form.append('expire', '0');
  form.append('file', buffer, {
    filename: finalFilename
  });

  const uploadResponse = await axios.post('https://postimages.org/json/rr', form, {
    headers: {
      ...form.getHeaders(),
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  if (!uploadResponse.data || uploadResponse.data.status !== 'OK') {
    throw new Error('Langkah 1 Gagal: Upload awal ke server.');
  }

  const galleryUrl = uploadResponse.data.url;
  const galleryPageResponse = await axios.get(galleryUrl);
  let $ = cheerio.load(galleryPageResponse.data);

  const viewerUrl = $('.thumb a.img').attr('href');
  if (!viewerUrl) {
    throw new Error('Langkah 2 Gagal: Tidak dapat menemukan link halaman viewer.');
  }

  const viewerPageResponse = await axios.get(viewerUrl);
  $ = cheerio.load(viewerPageResponse.data);

  const finalImageUrl = $('#main-image').attr('src');
  if (!finalImageUrl) {
    throw new Error('Langkah 3 Gagal: Tidak dapat menemukan link gambar final.');
  }

  return {
    url: finalImageUrl
  };
};

// --- Contoh Cara Penggunaan (opsional, untuk pengujian) ---

/* 
// Simpan kode di atas sebagai file, misal 'postImageUploader.js'

// Buat file lain untuk menggunakannya, misal 'test.js'
const uploadImage = require('./postImageUploader.js');
const path = require('path');

async function main() {
  try {
    // Ganti dengan path gambar yang ada di komputer Anda
    const imagePath = path.join(__dirname, 'nama-gambar-anda.jpg'); 
    
    console.log('Mengunggah dari path file...');
    const result = await uploadImage(imagePath);
    console.log('Upload sukses! URL:', result.url);

  } catch (error) {
    console.error('Terjadi error saat upload:', error.message);
  }
}

main();
*/