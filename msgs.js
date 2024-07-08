const fs = require('fs');
const { botName, prefix } = require('./src/info');
const { showMenu } = require('./src/menu');
const { saveUser, sendMessageToAll } = require('./src/util');
const { handleCommand } = require('./src/comandos');

const userFile = './src/user.json';

const loadUsers = () => {
    try {
        if (fs.existsSync(userFile)) {
            const data = fs.readFileSync(userFile);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Erro ao carregar user.json:", error);
    }
    return [];
};

const saveUserFile = (users) => {
    try {
        fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Erro ao salvar user.json:", error);
    }
};

let users = loadUsers();

const handleMessage = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const pushName = msg.pushName || 'Usuário';
    const isGroup = from.endsWith('@g.us');
    let groupName = '';

    if (isGroup) {
        const metadata = await sock.groupMetadata(from);
        groupName = metadata.subject;
    }

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

    const isNewUser = !users.some(user => user.id === from);

    if (isNewUser) {
        users.push({ id: from });
        saveUserFile(users);

        let welcomeMessage;
        if (isGroup) {
            welcomeMessage = `Saudações, *${groupName}*! Eu me chamo *${botName}*, e posso fazer várias coisas desde baixar música a gerar imagens. Fale com meu dono em caso de dúvida ou mau funcionamento.`;
        } else {
            welcomeMessage = `Bem-vindo, *${pushName}!* Eu me chamo *${botName}*, e posso fazer várias coisas desde baixar música a gerar imagens. Fale com meu dono em caso de dúvida ou mau funcionamento.`;
        }

        await sock.sendMessage(from, { text: welcomeMessage });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await showMenu(sock, from, msg);

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      'FN:Joaquim\n' +
                      'TEL;type=CELL;type=VOICE;waid=557481033040:+55 74 8103-3040\n' +
                      'END:VCARD';
        await sock.sendMessage(from, { contacts: { displayName: 'Joaquim', contacts: [{ vcard }] } });
    }

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
        await handleCommand(command, argument, sock, from, msg, pushName);
    } finally {
        await stopTyping();
    }
};

module.exports = { handleMessage };
