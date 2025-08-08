const axios = require('axios');
const xml2js = require('xml2js');

const generateTextCraftImage = async (text, text2, text3) => {
    const baseUrl = 'https://textcraft.net/gentext3.php';
    const query = new URLSearchParams({
        text,
        text2,
        text3,
        font_style: 'font1',
        font_size: 'x',
        font_colour: '0',
        bgcolour: '#2C262E',
        glow_halo: '0',
        glossy: '0',
        lighting: '0',
        fit_lines: '0',
        truecolour_images: '0',
        non_trans: 'false',
        glitter_border: 'true',
        text_border: '1',
        border_colour: '#2C262E',
        anim_type: 'none',
        submit_type: 'text',
        perspective_effect: '1',
        drop_shadow: '1',
        savedb: '0',
        multiline: '3',
        font_style2: 'font6',
        font_style3: 'font6',
        font_size2: 't',
        font_size3: 't',
        font_colour2: '68',
        font_colour3: '66',
        text_border2: '1',
        text_border3: '1',
        border_colour2: '#211E4E',
        border_colour3: '#EBD406'
    }).toString();

    const fullUrl = `${baseUrl}?${query}`;

    try {
        const response = await axios.get(fullUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Referer': 'https://textcraft.net/',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000,
            responseType: 'text'
        });

        const parsed = await xml2js.parseStringPromise(response.data);
        const filename = parsed.image.fullfilename[0];
        const datadir = parsed.image.datadir[0];

        const imageUrl = `https://static1.textcraft.net/${datadir}/${filename}`;
        return imageUrl;

    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = generateTextCraftImage;

// Cara pakainya wokkk

const generateTextCraftImage = require('./minecraft-text'); // Masukkan path dari mc.js mu wokkk

generateTextCraftImage('IWAK LELE', 'HMM', 'WOKKKKKKKk')
    .then(url => console.log(url))
    .catch(err => console.error( err));