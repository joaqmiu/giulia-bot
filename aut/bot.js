const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const Pino = require('pino');
const { makeInMemoryStore } = require('@whiskeysockets/baileys/lib/Store');
const { handleMessage } = require('../msgs');

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('sessao');
    const store = makeInMemoryStore({ logger: Pino().child({ level: 'silent', stream: 'store' }) });

    const sock = makeWASocket({
        auth: state,
        logger: Pino({ level: 'silent' }),
        store
    });

    store.bind(sock.ev);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key.fromMe) return;

        await sock.readMessages([{
            remoteJid: msg.key.remoteJid,
            id: msg.key.id,
            participant: msg.key.participant
        }]);

        await handleMessage(sock, msg);
    });

    sock.ev.on('groups.update', async (groups) => {
        console.log('Grupos atualizados', groups);
    });

    sock.ev.on('chats.update', async (chats) => {
        console.log('Chats atualizados', chats);
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            startBot();
        } else if (connection === 'open') {
            console.log('Conectado!');

            const chats = await store.chats.all();
            for (const chat of chats) {
                await sock.readMessages([{
                    remoteJid: chat.id,
                    id: chat.messages[0]?.key.id,
                    participant: chat.messages[0]?.key.participant
                }]);
                await delay(100);
            }
        }
    });
};

startBot();
