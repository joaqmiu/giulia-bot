const { botName, prefix } = require('./src/info');
const { downloadVideo, downloadAudio } = require('./src/ytdl');
const { handleGemini, handleGPT, handleImage } = require('./src/ia');
const { showMenu } = require('./src/menu');
const { handleSticker } = require('./src/stk');
const { saveUser, sendMessageToAll } = require('./src/util');
const { downloadAudio: downloadPlayAudio } = require('./src/play');
const { shortenUrl } = require('./src/link');
const { banUser, addUser, promoteUser, demoteUser } = require('./src/adm');

const handleMessage = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const pushName = msg.pushName || 'Usuário';

    let body = '';

    if (msg.message) {
        if (msg.message.conversation) {
            body = msg.message.conversation;
        } else if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) {
            body = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage && msg.message.imageMessage.caption) {
            body = msg.message.imageMessage.caption;
        } else if (msg.message.videoMessage && msg.message.videoMessage.caption) {
            body = msg.message.videoMessage.caption;
        }
    }

    saveUser({ id: from });

    if (!body.startsWith(prefix)) {
        return;
    }

    let command = '';
    let argument = '';

    if (body.startsWith(prefix)) {
        [command, ...args] = body.slice(prefix.length).split(' ');
        command = command.toLowerCase();
        argument = args.join(' ');
    }

    const sendMessage = async (messageContent) => {
        await sock.sendMessage(from, { text: messageContent.text, quoted: msg });
    };

    const startTyping = async () => {
        await sock.sendPresenceUpdate('composing', from);
    };

    const stopTyping = async () => {
        await sock.sendPresenceUpdate('paused', from);
    };

    try {
        await startTyping();

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
                        await sendMessage({ text: '*Você precisa marcar ou responder a uma imagem ou vídeo.*' });
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
                await sendMessage({ text: `*Seu link encurtado:*\n\n ${shortUrl}` });
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
                await sendMessage({ text: `*${botName}:\n Comando não reconhecido. Use ${prefix}menu para ver o menu.*` });
        }
    } finally {
        await stopTyping();
    }
};

module.exports = { handleMessage };
