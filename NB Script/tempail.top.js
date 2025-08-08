import axios from 'axios';

const tempail = {
  api: {
    base: 'https://tempail.top/api',
    endpoints: {
      createEmail: '/email/create/ApiTempail',
      getMessages: (emailToken) => `/messages/${emailToken}/ApiTempail`,
      getMessage: (messageId) => `/message/${messageId}/ApiTempail`
    }
  },

  headers: {
    'user-agent': 'Postify/1.0.0',
  },

  deletedInTimestamp: null,

  createEmail: async () => {
    try {
      const response = await axios.post(
        `${tempail.api.base}${tempail.api.endpoints.createEmail}`,
        null,
        { headers: tempail.headers }
      );

      if (response.data.status !== 'success') {
        return {
          success: false,
          code: 500,
          result: { error: 'Gagal bikin email temp nya bree..' }
        };
      }

      const {
        email,
        email_token: emailToken,
        deleted_in: deletedIn
      } = response.data.data;

      tempail.deletedInTimestamp = new Date(deletedIn).getTime();

      return {
        success: true,
        code: 200,
        email,
        emailToken,
        deletedIn
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  _isTempMailDeleted: () => {
    if (!tempail.deletedInTimestamp) return false;
    return Date.now() > tempail.deletedInTimestamp;
  },

  getMessages: async (emailToken) => {
    if (!emailToken || typeof emailToken !== 'string' || !emailToken.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Email token kagak boleh kosong yak bree, harus diisi.. 🗿' }
      };
    }

    if (tempail._isTempMailDeleted()) {
      return {
        success: false,
        code: 410,
        result: { error: 'Email Tempnya udah expired bree..' }
      };
    }

    try {
      const url = tempail.api.endpoints.getMessages(emailToken);
      const response = await axios.get(
        `${tempail.api.base}${url}`,
        { headers: tempail.headers }
      );

      if (response.data.status !== 'success') {
        return {
          success: false,
          code: 500,
          result: { error: 'Kagak bisa ngambil semua list pesan di Temp Mailnya bree... 🤣' }
        };
      }

      const { mailbox, messages } = response.data.data;

      return {
        success: true,
        code: 200,
        mailbox,
        messages
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  getMessage: async (messageId) => {
    if (!messageId || typeof messageId !== 'string' || !messageId.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Message ID nya harus diisi bree, kagak kosong yak.. 🗿' }
      };
    }

    if (tempail._isTempMailDeleted()) {
      return {
        success: false,
        code: 410,
        result: { error: 'Email Tempnya udah expired bree..' }
      };
    }

    try {
      const url = tempail.api.endpoints.getMessage(messageId);
      const response = await axios.get(
        `${tempail.api.base}${url}`,
        { headers: tempail.headers }
      );

      if (response.data.status !== 'success') {
        return {
          success: false,
          code: 500,
          result: { error: 'Kagak bisa ambil pesannya bree 😂' }
        };
      }

      const [message] = response.data.data;

      return {
        success: true,
        code: 200,
        message: {
          subject: message.subject,
          isSeen: message.is_seen,
          from: message.from,
          fromEmail: message.from_email,
          receivedAt: message.receivedAt,
          id: message.id,
          attachments: message.attachments,
          content: message.content
        }
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  }
};

export { tempail };