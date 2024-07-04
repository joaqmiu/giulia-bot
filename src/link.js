const debug = require('debug')('bot:link');
const axios = require('axios');

const shortenUrl = async (url) => {
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao encurtar o link:', error);
        throw new Error('Ocorreu um erro ao encurtar o link.');
    }
};

module.exports = { shortenUrl };

