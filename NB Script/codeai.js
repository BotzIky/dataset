import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const codeAI = {
  api: {
    base: 'https://django-app-4tbtjdxw2a-uc.a.run.app',
    endpoints: {
      promptToCode: '/prompt_to_code/',
      detectBugs: '/detect_bugs/',
      convertCode: '/convert_code/',
      explainCode: '/code_explainer/',
      imageToSolve: '/image_to_solve/'
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0',
    'content-type': 'application/json',
    'accept': 'application/json'
  },

  languages: {
    html: 1, c: 2, 'c++': 3, 'c#': 4, dart: 5, java: 6, swift: 7, python: 8, r: 9,
    javascript: 10, matlab: 11, ruby: 12, typescript: 13, kotlin: 14, go: 15, jshell: 16,
    python2: 17, groovy: 18, nodejs: 19, scala: 20, assembly: 21, julia: 22, 'objective-j': 23,
    rust: 24, react: 25, angular: 26, perlu: 27, lua: 28, php: 29, jquery: 30, bootstrap: 31,
    vue: 32, 'objective-c': 33, clojure: 34, vue3: 35, fotran: 36, cobol: 37, crystal: 38
  },

  ip: () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.'),

  promptToCode: async (prompt, language) => {
    const langId = codeAI.languages[language?.toLowerCase()];
    if (!prompt || !langId) {
      return {
        success: false,
        code: 400,
        result: { error: 'Prompt ama Bahasanya kagak boleh kosong bree 🗿' }
      };
    }

    const payload = {
      prompt: prompt.trim(),
      language: langId,
      ip_address: codeAI.ip()
    };

    try {
      const response = await axios.post(
        `${codeAI.api.base}${codeAI.api.endpoints.promptToCode}`,
        payload,
        { headers: codeAI.headers }
      );

      const { Status, Data, Message } = response.data;
      if (Status !== 1 || !Data) {
        return {
          success: false,
          code: 422,
          result: { error: Message || 'Ngeprompt codenya gagal bree, ckptw aja 😂' }
        };
      }

      const { title, language, code, explanation } = Data;
      return {
        success: true,
        code: 200,
        result: { title, language, code, explanation }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree.. 🙃' }
      };
    }
  },

  detectBugs: async (code) => {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return {
        success: false,
        code: 400,
        result: { error: 'Etdah.. gimana mau detect bug bree, codenya aja kosong begitu 😂' }
      };
    }

    const payload = {
      code: code.trim(),
      ip_address: codeAI.ip()
    };

    try {
      const response = await axios.post(
        `${codeAI.api.base}${codeAI.api.endpoints.detectBugs}`,
        payload,
        { headers: codeAI.headers }
      );

      const { Status, Data, Message } = response.data;
      if (Status !== 1 || !Data) {
        return {
          success: false,
          code: 422,
          result: { error: Message || 'Detect bugnya gagal bree, ckptw aja 😂' }
        };
      }

      const { title, language, code: fixedCode, explanation } = Data;
      return {
        success: true,
        code: 200,
        result: { title, language, code: fixedCode, explanation }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 🫵🏻🤣' }
      };
    }
  },

  convertCode: async (code, sourceLanguage, targetLanguage) => {
    const targetId = codeAI.languages[targetLanguage?.toLowerCase()];
    if (!code || !targetId) {
      return {
        success: false,
        code: 400,
        result: { error: 'Aelah, code ama target bahasanya jangan kosong yak bree 🗿' }
      };
    }

    const prompt = sourceLanguage
      ? `${sourceLanguage}\n\n${code}`.trim()
      : code.trim();

    const payload = {
      prompt,
      language: targetId,
      ip_address: codeAI.ip()
    };

    try {
      const response = await axios.post(
        `${codeAI.api.base}${codeAI.api.endpoints.convertCode}`,
        payload,
        { headers: codeAI.headers }
      );

      const { Status, Data, Message } = response.data;
      if (Status !== 1 || !Data) {
        return {
          success: false,
          code: 422,
          result: { error: Message || 'Convert codenya gagal bree, ckptw aja 😂' }
        };
      }

      const { title, language, code: convertedCode, explanation } = Data;
      return {
        success: true,
        code: 200,
        result: { title, language, code: convertedCode, explanation }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  },

  explainCode: async (code, language) => {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return {
        success: false,
        code: 400,
        result: { error: 'Kodenya kagak boleh kosong bree ..aelah 🗿' }
      };
    }

    const payload = {
      code: code.trim(),
      optional_param: language ? language.trim() : '',
      ip_address: codeAI.ip()
    };

    try {
      const response = await axios.post(
        `${codeAI.api.base}${codeAI.api.endpoints.explainCode}`,
        payload,
        { headers: codeAI.headers }
      );

      const { Status, Data, Message } = response.data;
      if (Status !== 1 || !Data) {
        return {
          success: false,
          code: 422,
          result: { error: Message || 'Explain codenya gagal bree, ckptw aja 😂' }
        };
      }

      const { title, language, code: explainedCode, explanation } = Data;
      return {
        success: true,
        code: 200,
        result: { title, language, code: explainedCode, explanation }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  },

  imageToSolve: async (prompt, imagex, language) => {
    const langId = codeAI.languages[language?.toLowerCase()];
    if (!langId || !imagex) {
      return {
        success: false,
        code: 400,
        result: { error: 'Bahasa ama image nya kagak boleh kosong yak bree 🗿' }
      };
    }

    try {
      const formData = new FormData();
      formData.append('prompt', prompt || '');
      formData.append('image', fs.createReadStream(imagex));
      formData.append('ip_address', codeAI.ip());
      formData.append('language', langId);

      const response = await axios.post(
        `${codeAI.api.base}${codeAI.api.endpoints.imageToSolve}`,
        formData,
        { headers: formData.getHeaders() }
      );

      const { Status, Data, Message } = response.data;
      if (Status !== 1 || !Data) {
        return {
          success: false,
          code: 422,
          result: { error: Message || 'Image to Solvenya gagal bree, ckptw aja 🫵🏻😂' }
        };
      }

      const { title, language, code, explanation } = Data;
      return {
        success: true,
        code: 200,
        result: { title, language, code, explanation }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { 
            error: err.message || 'Error bree 😂'
         }
      };
    }
  }
};

export { codeAI };