const debug = require('debug')('bot:ia');
const { Hercai } = require('hercai');
const { prefix } = require('./info');

const herc = new Hercai(); 

const replaceGreeting = (response, pushName) => {
    return response.replace(/\bOi\b/g, `Oi, ${pushName}`).replace(/\bOlá\b/g, `Olá, ${pushName}`);
};

const handleGemini = async (sock, from, message, pushName) => {
    try {
        const response = await herc.question({ model: "gemini", content: message });
        const customizedResponse = replaceGreeting(response.reply, pushName);
        await sock.sendMessage(from, { text: customizedResponse });
    } catch (error) {
        await sock.sendMessage(from, { text: `*Erro ao obter resposta da Gemini:* ${error.message}` });
    }
};

const handleGPT = async (sock, from, message, pushName) => {
    try {
        const response = await herc.question({ model: "v3", content: message });
        const customizedResponse = replaceGreeting(response.reply, pushName);
        await sock.sendMessage(from, { text: customizedResponse });
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
