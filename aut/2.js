const path = require("path");
const readline = require("readline");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay
} = require("@whiskeysockets/baileys");
const Pino = require("pino");
const { makeInMemoryStore } = require('@whiskeysockets/baileys/lib/Store');
const qrcode = require("qrcode-terminal");
const { handleMessage } = require('../msgs');

const question = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  }));
};

const onlyNumbers = (str) => {
  return str.replace(/\D/g, '');
};

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('sessao');
  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({ logger: Pino().child({ level: 'silent', stream: 'store' }) });

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: 'silent' }),
    version,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    printQRInTerminal: false,
    markOnlineOnConnect: true,
    store
  });

  store.bind(sock.ev);

  if (!sock.authState.creds.registered) {
    const phoneNumber = await question("Informe o seu número de telefone: ");

    if (!phoneNumber) {
      throw new Error("Número de telefone inválido!");
    }

    const code = await sock.requestPairingCode(onlyNumbers(phoneNumber));

    console.log(`Código de pareamento: ${code}`);
  }

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
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      }
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
