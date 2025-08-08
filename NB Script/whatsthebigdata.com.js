async function askAI(prompt, modelKey) {
    const axios = require('axios')
    const models = {
        'ChatGPT-4o': 'chatgpt-4o',
        'ChatGPT-4o Mini': 'chatgpt-4o-mini',
        'Claude 3 Opus': 'claude-3-opus',
        'Claude 3.5 Sonnet': 'claude-3-sonnet',
        'Llama 3': 'llama-3',
        'Llama 3.1 (Pro)': 'llama-3-pro',
        'Perplexity AI': 'perplexity-ai',
        'Mistral Large': 'mistral-large',
        'Gemini 1.5 Pro': 'gemini-1.5-pro'
    }

    const modelKeys = Object.keys(models);
    if (!modelKeys.includes(modelKey)) {
        return { status: 403, message: `Model Yang anda masukan tidak ada di daftar.`, models: modelKeys }
    }
    try {
        const { data } = await axios.post('https://whatsthebigdata.com/api/ask-ai/', {
            message: prompt,
            model: modelKey,
            history: []
        }, {
            headers: {
                'content-type': 'application/json',
                'origin': 'https://whatsthebigdata.com',
                'referer': 'https://whatsthebigdata.com/ai-chat/',
                'user-agent': 'Mozilla/5.0'
            }
        })
        return data.text
    } catch (e) {
        return e.message
    }
}

// askAI('hello', 'ChatGPT-4o').then(response => {
//     console.log(response);
// }).catch(error => {
//     console.error('Error in askAI:', error);
// });
// module.exports = { askAI }