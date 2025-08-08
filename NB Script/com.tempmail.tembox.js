import axios from 'axios';

const tempmail = {
  api: {
    base: 'https://api.tempmail.lol',
    endpoints: {
      create: '/v2/inbox/create',
      inbox: token => `/v2/inbox?token=${token}`
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0'
  },

  create: async (prefix = null) => {
    try {
      const payload = { domain: null, captcha: null };
      if (prefix) payload.prefix = prefix;

      const { data } = await axios.post(
        `${tempmail.api.base}${tempmail.api.endpoints.create}`,
        payload,
        { headers: tempmail.headers }
      );

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + (60 * 60 * 1000));

      return {
        success: true,
        code: 200,
        result: {
          address: data.address,
          token: data.token,
          expiresAt
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: error.message }
      };
    }
  },

  checkInbox: async (token, expiresAt) => {
    try {
      if (!token || token.trim() === '') {
        return {
          success: true,
          code: 200,
          result: {
            token: null,
            emails: [],
            expiresAt: expiresAt.toISOString()
          }
        };
      }

      let attempt = 0;
      let inboxnya;

      while (true) {
        if (new Date() > expiresAt) {
          return {
            success: false,
            code: 410,
            result: { error: 'Token buat email ini udah expired bree, kagak bisa diakses 😂', expiresAt }
          };
        }

        const { data } = await axios.get(
          `${tempmail.api.base}${tempmail.api.endpoints.inbox(token)}`,
          { headers: tempmail.headers }
        );

        if (data.expired) {
          return {
            success: false,
            code: 410,
            result: { error: 'Emailnya udah expired bree.. bikin tempmail yang baru aja gih... ' }
          };
        }

        if (data.emails?.length > 0) {
          inboxnya = data;
          break;
        }

        attempt++;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const emails = inboxnya.emails.map(e => ({
        id: e.id || e._id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        createdAt: e.createdAt,
        attachments: e.attachments || []
      }));

      return {
        success: true,
        code: 200,
        result: {
          token,
          expired: inboxnya.expired,
          expiresAt: expiresAt.toISOString(),
          emails
        }
      };
    } catch (error) {
      return {
        success: false,
        code: error?.response?.status || 500,
        result: { error: error.message }
      };
    }
  }
};

export { tempmail };