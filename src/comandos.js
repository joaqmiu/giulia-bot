const { downloadVideo, downloadAudio } = require('./ytdl');
const { handleGemini, handleGPT, handleImage } = require('./ia');
const { showMenu } = require('./menu');
const { handleSticker } = require('./stk');
const { downloadAudio: downloadPlayAudio } = require('./play');
const { shortenUrl } = require('./link');
const { banUser, addUser, promoteUser, demoteUser } = require('./adm');

const handleCommand = async (command, argument, sock, from, msg, pushName) => {
    switch (command) {
        case 'vid':
            await downloadVideo(sock, from, argument, msg);
            break;
        case 'aud':
            await downloadAudio(sock, from, argument, msg);
            break;
        case 'gem':
            await handleGemini(sock, from, argument, pushName);
            break;
        case 'gpt':
            await handleGPT(sock, from, argument, pushName);
            break;
        case 'img':
            await handleImage(sock, from, argument);
            break;
        case 'menu':
            await showMenu(sock, from, msg);
            break;
        case 's':
        case 'sticker':
        case 'fig':
            if (msg.message.extendedTextMessage) {
                const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                if (quotedMsg) {
                    await handleSticker(sock, { ...msg, message: quotedMsg }, msg);
                } else {
                    await sock.sendMessage(from, { text: '*Você precisa marcar ou responder a uma imagem ou vídeo.*' });
                }
            } else {
                await handleSticker(sock, msg, msg);
            }
            break;
        case 'play':
            await downloadPlayAudio(sock, from, argument, msg);
            break;
        case 'tm':
            await sendMessageToAll(sock, argument, msg);
            break;
        case 'encurta':
        case 'short':
            const shortUrl = await shortenUrl(argument);
            await sock.sendMessage(from, { text: `*Seu link encurtado:*\n\n ${shortUrl}` });
            break;
        case 'ban':
            await banUser(sock, msg);
            break;
        case 'add':
            await addUser(sock, from, argument, msg);
            break;
        case 'adm':
            await promoteUser(sock, msg);
            break;
        case 'reb':
            await demoteUser(sock, msg);
            break;
        default:
            await sock.sendMessage(from, { text: `*Comando não reconhecido. Use o prefixo correto para ver o menu.*` });
    }
};

module.exports = { handleCommand };
