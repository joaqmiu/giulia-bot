const debug = require('debug')('bot:ia');
const { Hercai } = require('hercai');
const { prefix } = require('./info');

const herc = new Hercai();

const userContexts = {};
const userTimeouts = {};

const scheduleContextReset = (userId) => {
    if (userTimeouts[userId]) {
        clearTimeout(userTimeouts[userId]);
    }
    userTimeouts[userId] = setTimeout(() => {
        delete userContexts[userId];
        delete userTimeouts[userId];
    }, 30 * 60 * 1000);
};

const updateUserContext = (userId, message) => {
    if (!userContexts[userId]) {
        userContexts[userId] = [];
    }
    userContexts[userId].push(message);
    if (userContexts[userId].length > 10) {
        userContexts[userId].shift();
    }
    scheduleContextReset(userId);
};

const getUserContext = (userId) => {
    return userContexts[userId] ? userContexts[userId].join('\n') : '';
};

const handleGemini = async (sock, from, message, pushName) => {
    try {
        updateUserContext(from, message);
        const userContext = getUserContext(from);
        const response = await herc.question({ model: "gemini", content: `${userContext}\n${message}` });
        updateUserContext(from, response.reply);
        await sock.sendMessage(from, { text: response.reply });
    } catch (error) {
        await sock.sendMessage(from, { text: `*Erro ao obter resposta da Gemini:* ${error.message}` });
    }
};

const handleGPT = async (sock, from, message, pushName) => {
    try {
        updateUserContext(from, message);
        const userContext = getUserContext(from);
        const response = await herc.question({ model: "v3", content: `${userContext}\n${message}` });
        updateUserContext(from, response.reply);
        await sock.sendMessage(from, { text: response.reply });
    } catch (error) {
        await sock.sendMessage(from, { text: `*Erro ao obter resposta do GPT:* ${error.message}` });
    }
};

const handleImage = async (sock, from, prompt) => {
    try {
        const response = await herc.drawImage({ model: "simurg", prompt: prompt, negative_prompt: "" });
        await sock.sendMessage(from, { image: { url: response.url }, caption: prompt });
    } catch (error) {
        await sock.sendMessage(from, { text: `*Erro ao gerar imagem:* ${error.message}` });
    }
};

module.exports = { handleGemini, handleGPT, handleImage };
