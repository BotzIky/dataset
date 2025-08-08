import axios from 'axios';

const gcamator = {
  api: {
    base: 'https://gcamator.gtgroup.dev/api/values',
    endpoints: {
      jikem: '/getgcamsnew/',
      specs: (manufacturer, model) => `/getspecs/${manufacturer}/${model}`
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0'
  },

  info: async (manufacturer, model) => {
    try {
      if (!manufacturer?.trim() || !model?.trim()) {
        return {
          success: false,
          code: 400,
          result: { error: 'Manufacturer ama modelnya wajib diisi yak bree... 🗿' }
        };
      }

      const base = `${gcamator.api.base}${gcamator.api.endpoints.jikem}`;
      const jikem = await axios.get(base, { headers: gcamator.headers });
      const gcam = jikem.data.find(
        item =>
          item.manufacturer.toLowerCase() === manufacturer.toLowerCase() &&
          item.model.toLowerCase() === model.toLowerCase()
      );

      if (!gcam) {
        return {
          success: false,
          code: 404,
          result: { error: 'Device lu kagak ada bree di databasenya Gcamator 😂' }
        };
      }


      const a = `${gcamator.api.base}${gcamator.api.endpoints.specs(manufacturer, model)}`;
      const { data: specs } = await axios.get(a, { headers: gcamator.headers });

      if (!specs?.id) {
        return {
          success: false,
          code: 404,
          result: { error: 'Spesifikasi device lu kagak ada bree.. ganti device yang lain aja dah 😂' }
        };
      }

      return {
        success: true,
        code: 200,
        result: {
          id: gcam.id,
          model: gcam.model,
          manufacturer: gcam.manufacturer,
          androidVersion: gcam.androidVersion || specs.androidVersion || '',
          appVersion: gcam.appVersion || '',
          isTested: gcam.isTested ?? false,
          download: `https://gcamator.gtgroup.dev/api/values/${gcam.id}`,
          specs: {
            id: specs.id,
            chipset: specs.chipset,
            battery: specs.battery,
            displaySize: specs.displaySize,
            displayType: specs.displayType,
            displayResolution: specs.displayResolution,
            cpu: specs.cpu,
            gpu: specs.gpu,
            internal: specs.internal,
            mainCameraSpecs: specs.mainCameraSpecs,
            selfieCameraSpecs: specs.selfieCameraSpecs,
            sensors: specs.sensors,
            colors: specs.colors,
            charging: specs.charging
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: error.message || 'Error bree 😂' }
      };
    }
  }
};

export { gcamator };