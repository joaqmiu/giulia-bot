const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const Pino = require('pino');
const { handleMessage } = require('../msgs');

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('sessao');

    const sock = makeWASocket({
        auth: state,
        logger: Pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key.fromMe) return;
        await handleMessage(sock, msg);
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            startBot();
        } else if (connection === 'open') {
            console.log('Conectado!');
        }
    });
};

startBot();
