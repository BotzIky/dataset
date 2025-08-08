import axios from 'axios';
import qs from 'qs';

const loman = {
  api: {
    base: 'https://loman.id/resapp',
    locations: 'https://loeman.loman.id',
    endpoints: {
      getCouriers: '/getdropdown.php',
      track: '/',
      searchLocation: '?cari=',
      calculateShipping: '/'
    }
  },

  headers: {
    'user-agent': 'Postify/1.0.0',
    'content-type': 'application/x-www-form-urlencoded'
  },

  ntext: (text) => {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  },

  searchLocation: async (query) => {
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        code: 400,
        result: { error: 'Nama lokasinya kagak boleh kosong begini yak.. 🗿' }
      };
    }

    try {
      const response = await axios.get(
        `${loman.api.locations}${loman.api.endpoints.searchLocation}${encodeURIComponent(query)}`,
        { headers: loman.headers, timeout: 5000 }
      );

      if (!Array.isArray(response.data) || response.data.length === 0) {
        return {
          success: false,
          code: 404,
          result: { error: `Lokasi "${query}" kagak ketemu bree ... 😆` }
        };
      }

      return {
        success: true,
        code: 200,
        result: {
          query: query,
          locations: response.data.map(loc => ({
            id: loc.id,
            name: loc.nama,
            normalized: loman.ntext(loc.nama)
          }))
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { 
          error: 'Kagak bisa nyari lokasinya bree ...'
        }
      };
    }
  },

  findLocationId: async (locationName) => {
    try {
      const sr = await loman.searchLocation(locationName);
      if (!sr.success) return null;

      const ni = loman.ntext(locationName);
      const exactMatch = sr.result.locations.find(
        loc => loc.normalized === ni
      );

      return exactMatch?.id || sr.result.locations[0]?.id || null;
    } catch (err) {
      return null;
    }
  },

  calculateShippingByCity: async (originCity, destinationCity, weight) => {
    if (!originCity || !destinationCity) {
      return {
        success: false,
        code: 400,
        result: { error: 'Kota asal ama tujuan kudu diisi yak bree...' }
      };
    }

    if (!weight || isNaN(weight) || Number(weight) <= 0) {
      return {
        success: false,
        code: 400,
        result: { error: 'Berat paket kudu angka lebih dari 0 yak bree 🗿' }
      };
    }

    try {
      const [originId, destinationId] = await Promise.all([
        loman.findLocationId(originCity),
        loman.findLocationId(destinationCity)
      ]);

      if (!originId) {
        return {
          success: false,
          code: 404,
          result: { error: `Kota asal "${originCity}" kagak ketemu bree... ` }
        };
      }

      if (!destinationId) {
        return {
          success: false,
          code: 404,
          result: { error: `Kota tujuan "${destinationCity}" kagak ketemu bree...` }
        };
      }

      return await loman.calculateShippingById(originId, destinationId, weight);

    } catch (err) {
      return {
        success: false,
        code: 500,
        result: { 
          error: 'Waduh, error bree pas ngitung ongkirnya .. 😆',
        }
      };
    }
  },

  calculateShippingById: async (originId, destinationId, weight) => {
    try {
      const data = qs.stringify({
        idAsal: originId,
        idTujuan: destinationId,
        berat: weight
      });

      const response = await axios.post(
        `${loman.api.locations}${loman.api.endpoints.calculateShipping}`,
        data,
        { 
          headers: loman.headers,
          timeout: 10000 
        }
      );

      if (response.data?.status !== 'berhasil') {
        return {
          success: false,
          code: 500,
          result: { error: 'Kagak bisa ngambil data ongkirnya bree ... ✌🏻' }
        };
      }

      return {
        success: true,
        code: 200,
        result: {
          route: {
            origin: response.data.detail?.dari || 'Teu nyaho 🙈',
            destination: response.data.detail?.menuju || 'Teu nyaho 🙈',
            weight: response.data.detail?.berat || `${weight} kg`
          },
          couriers: response.data.data?.map(courier => ({
            name: courier.ekspedisi,
            services: courier.daftarHarga?.map(service => ({
              code: service.service,
              description: service.description,
              price: service.harga.replace(/\s+/g, ' ').trim(),
              estimate: service.estimasi || 'Teu nyaho 🙈'
            })) || []
          })) || []
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { 
          error: 'Kagak bisa ngitung ongkirnya bree..',
        }
      };
    }
  },

  getCourierList: async () => {
    try {
      const response = await axios.get(
        `${loman.api.base}${loman.api.endpoints.getCouriers}`,
        { 
          headers: loman.headers,
          timeout: 5000 
        }
      );

      if (response.data?.status !== 'berhasil') {
        return {
          success: false,
          code: 500,
          result: { error: 'Kagak bisa ngambil list kurirnya bree 😁' }
        };
      }

      return {
        success: true,
        code: 200,
        result: {
          couriers: response.data.data.map(c => ({
            name: c.title,
            normalized: loman.ntext(c.title)
          }))
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { 
          error: 'Kagak bisa ngambil list kurirnya bree...',
        }
      };
    }
  },

  track: async (resi, courierName) => {
    if (!resi || !courierName) {
      return {
        success: false,
        code: 400,
        result: { error: 'Nomor resi ama nama ekspedisinya kudu diisi yak...' }
      };
    }

    try {
      const couriers = await loman.getCourierList();
      if (!couriers.success) return couriers;

      const ni = loman.ntext(courierName);
      const mc = couriers.result.couriers.find(
        c => c.normalized.includes(ni) || 
             ni.includes(c.normalized)
      );

      if (!mc) {
        return {
          success: false,
          code: 404,
          result: { 
            error: `Ekspedisi "${courierName}" kagak ketemu bree...`,
            couriers: couriers.result.couriers.map(c => c.name)
          }
        };
      }

      const data = qs.stringify({
        resi: resi,
        ex: mc.name
      });

      const response = await axios.post(
        `${loman.api.base}${loman.api.endpoints.track}`,
        data,
        { 
          headers: loman.headers,
          timeout: 10000 
        }
      );

      if (response.data?.status !== 'berhasil') {
        return {
          success: false,
          code: 500,
          result: { error: 'Kagak bisa ngelacak paket nya bree 😎' }
        };
      }

      const history = Array.isArray(response.data.history)
        ? response.data.history.map(item => ({
            datetime: item.tanggal,
            description: item.details,
            timestamp: new Date(item.tanggal.replace('Pukul', '')).getTime() || null
          }))
        : [];

      return {
        success: true,
        code: 200,
        result: {
          courier: mc.name,
          resi: resi,
          status: response.data.details?.status || 'Tidak diketahui',
          message: response.data.details?.infopengiriman || '',
          tips: response.data.details?.ucapan || '',
          history: history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { 
          error: 'Kagak bisa ngelacak paket nya bree... 🤙🏻',
        }
      };
    }
  },
  
  searchCouriers: async (keyword) => {
    if (!keyword) {
      return {
        success: false,
        code: 400,
        result: { error: 'Kata kunci pencariannya kudu diisi yak bree 🗿' }
      };
    }

    try {
      const couriers = await loman.getCourierList();
      if (!couriers.success) return couriers;

      const nk = loman.ntext(keyword);
      const found = couriers.result.couriers.filter(c => 
        c.normalized.includes(nk)
      );

      if (found.length === 0) {
        return {
          success: false,
          code: 404,
          result: { 
            error: 'Kagak bisa nemu ekspedisinya bree .. 😂',
            suggestions: couriers.result.couriers.map(c => c.name)
          }
        };
      }

      return {
        success: true,
        code: 200,
        result: {
          couriers: found.map(c => c.name)
        }
      };

    } catch (err) {
      return {
        success: false,
        code: 500,
        result: { error: 'Kagak bisa nyari ekspedisinya bree...' }
      };
    }
  }
};

export { loman };