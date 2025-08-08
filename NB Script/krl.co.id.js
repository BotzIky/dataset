/**
 * KRL COMMUTE - C-Access
 * API Client untuk mengakses informasi KRL Commute
 * 
 * @author gienetic
 * @base https://play.google.com/store/apps/details?id=com.kci.access
 */

const axios = require('axios');

const API_URL = 'https://api-partner.krl.co.id';
const API_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIyOGMzYzg3YTY3ZTRjYWE4YTI0MjYxZGYwYzIxNjYzODA4NWM2NWU4ZjhiYzQ4OGNlM2JiZThmYWNmODU4YzY0YmI0MjgyM2EwOTUiLCJpYXQiOjE3MjI2MTc1MTQsIm5iZiI6MTcyMjYxNzUxNCwiZXhwIjoxNzU0MTUzNTE0LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.Jz_sedcMtaZJ4dj0eWVc4_pr_wUQ3s1-UgpopFGhEmJt_iGzj6BdnOEEhcDDdIz-gydQL5ek0S_36v5h6P_X3OQyII3JmHp1SEDJMwrcy4FCY63-jGnhPBb4sprqUFruDRFSEIs1cNQ-3rv3qRDzJtGYc_bAkl2MfgZj85bvt2DDwBWPraZuCCkwz2fJvox-6qz6P7iK9YdQq8AjJfuNdl7t_1hMHixmtDG0KooVnfBV7PoChxvcWvs8FOmtYRdqD7RSEIoOXym2kcwqK-rmbWf9VuPQCN5gjLPimL4t2TbifBg5RWNIAAuHLcYzea48i3okbhkqGGlYTk3iVMU6Hf_Jruns1WJr3A961bd4rny62lNXyGPgNLRJJKedCs5lmtUTr4gZRec4Pz_MqDzlEYC3QzRAOZv0Ergp8-W1Vrv5gYyYNr-YQNdZ01mc7JH72N2dpU9G00K5kYxlcXDNVh8520-R-MrxYbmiFGVlNF2BzEH8qq6Ko9m0jT0NiKEOjetwegrbNdNq_oN4KmHvw2sHkGWY06rUeciYJMhBF1JZuRjj3JTwBUBVXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc';

const HEADERS = {
  'Authorization': API_TOKEN,
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
};

/**
 * Mendapatkan daftar semua stasiun KRL
 * @returns {Promise<Array>} Array berisi data stasiun
 */
async function getAllStations() {
  try {
    const response = await axios.get(`${API_URL}/krl-webs/v1/krl-station`, { headers: HEADERS });
    return response.data.data || [];
  } catch (error) {
    console.error("❌ Gagal mendapatkan daftar stasiun:", error.response?.data?.message || error.message);
    return [];
  }
}

/**
 * Menampilkan informasi rute dan daftar stasiun
 */
async function infoRoute() {
  const stations = await getAllStations();
  
  if (!stations.length) {
    console.log("⚠️ Tidak ada data stasiun yang tersedia");
    return;
  }

  console.log("🚉 Daftar Stasiun KRL:");
  console.log("----------------------");
  
  stations.forEach((station, index) => {
    console.log(`${index + 1}. ${station.sta_name}`);
  });
}

/**
 * Mencari stasiun berdasarkan nama
 * @param {string} stationName Nama stasiun
 * @returns {Promise<Object|null>} Data stasiun jika ditemukan
 */
async function getStationId(stationName) {
  if (!stationName) {
    console.log("⚠️ Nama stasiun tidak boleh kosong");
    return null;
  }

  const stations = await getAllStations();
  return stations.find(station => 
    station.sta_name.toLowerCase().includes(stationName.toLowerCase())
  );
}

/**
 * Menampilkan tarif perjalanan antar stasiun
 * @param {string} origin Stasiun asal
 * @param {string} destination Stasiun tujuan
 */
async function tarifKereta(origin, destination) {
  try {
    const [originData, destinationData] = await Promise.all([
      getStationId(origin),
      getStationId(destination)
    ]);

    if (!originData || !destinationData) {
      console.log("❌ Stasiun tidak ditemukan. Pastikan nama stasiun benar.");
      return;
    }

    const response = await axios.get(
      `${API_URL}/krl-webs/v1/fare?stationfrom=${originData.sta_id}&stationto=${destinationData.sta_id}`,
      { headers: HEADERS }
    );

    const fareData = response.data.data?.[0];
    if (fareData) {
      console.log(`💰 Tarif ${originData.sta_name} → ${destinationData.sta_name}:`);
      console.log(`   - Harga: Rp ${fareData.fare}`);
      console.log(`   - Jarak: ${fareData.distance} km`);
    } else {
      console.log("ℹ️ Tarif tidak tersedia untuk rute ini");
    }
  } catch (error) {
    console.error("❌ Gagal mengambil tarif:", error.response?.data?.message || error.message);
  }
}

/**
 * Menampilkan jadwal kereta di stasiun tertentu
 * @param {string} stationName Nama stasiun
 * @param {string} startTime Waktu mulai (HH:MM)
 * @param {string} endTime Waktu selesai (HH:MM)
 */
async function jadwalKereta(stationName, startTime, endTime) {
  try {
    const stationData = await getStationId(stationName);
    
    if (!stationData) {
      console.log("❌ Stasiun tidak ditemukan");
      return;
    }

    const response = await axios.get(
      `${API_URL}/krl-webs/v1/schedule?stationid=${stationData.sta_id}&timefrom=${startTime}&timeto=${endTime}`,
      { headers: HEADERS }
    );

    const schedules = response.data.data;
    if (schedules?.length) {
      console.log(`🚉 Jadwal KRL di ${stationData.sta_name} (${startTime} - ${endTime}):`);
      console.log("--------------------------------------------------");
      
      schedules.forEach((schedule, index) => {
        console.log(`${index + 1}. ${schedule.ka_name} → ${schedule.dest}`);
        console.log(`   🕒 Berangkat: ${schedule.time_est}`);
        console.log(`   🕒 Tiba: ${schedule.dest_time}`);
        console.log("--------------------------------------------------");
      });
    } else {
      console.log("ℹ️ Tidak ada jadwal kereta pada waktu yang diminta");
    }
  } catch (error) {
    console.error("❌ Gagal mengambil jadwal:", error.response?.data?.message || error.message);
  }
}

//infoRoute();
//tarifKereta('Bogor', 'Bekasi');
//jadwalKereta('Bogor', '07:00', '09:00');

module.exports = { 
  infoRoute, 
  tarifKereta, 
  jadwalKereta
};