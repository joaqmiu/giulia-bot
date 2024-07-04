const path = require("path");
const readline = require("readline");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const Pino = require("pino");
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

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: 'silent' }),
    version,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    printQRInTerminal: false,
    markOnlineOnConnect: true,
  });

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
    await handleMessage(sock, msg);
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('Conectado!');
    }
  });
};

startBot();
