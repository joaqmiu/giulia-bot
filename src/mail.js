const axios = require('axios');
const ONESECMAIL_API_URL = 'https://www.1secmail.com/api/v1/';

async function generateEmail() {
    try {
        const response = await axios.get(`${ONESECMAIL_API_URL}?action=genRandomMailbox&count=1`);
        return response.data[0];
    } catch (error) {
        console.error('Erro ao gerar o e-mail:', error.message);
        return null;
    }
}

async function getMessages(email) {
    try {
        const [login, domain] = email.split('@');
        const response = await axios.get(`${ONESECMAIL_API_URL}?action=getMessages&login=${login}&domain=${domain}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error.message);
        return [];
    }
}

async function readMessage(email, id) {
    try {
        const [login, domain] = email.split('@');
        const response = await axios.get(`${ONESECMAIL_API_URL}?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao ler a mensagem:', error.message);
        return null;
    }
}

const generateTemporaryEmail = async (sock, from, msg) => {
    const email = await generateEmail();
    if (!email) {
        await sock.sendMessage(from, { text: '*Erro ao gerar o e-mail temporário.*' });
        return;
    }

    await sock.sendMessage(from, { text: `*Seu e-mail foi gerado com sucesso!*\n\n${email}\n\n*Esse endereço e-mail é válido por 50 minutos!*` });

    const sentMessageIds = new Set();

    const interval = setInterval(async () => {
        const messages = await getMessages(email);
        for (const message of messages) {
            if (!sentMessageIds.has(message.id)) {
                const detailedMessage = await readMessage(email, message.id);
                if (detailedMessage) {
                    await sock.sendMessage(from, {
                        text: `*Nova mensagem recebida de*: ${detailedMessage.from}\n\n*Assunto:* ${detailedMessage.subject}\n\n*Conteúdo:* ${detailedMessage.textBody}`
                    });
                    sentMessageIds.add(message.id);
                }
            }
        }
    }, 5000);

    setTimeout(() => {
        clearInterval(interval);
        sock.sendMessage(from, { text: '*O tempo de validade do e-mail temporário expirou.*' });
    }, 3000000);
};

module.exports = { generateTemporaryEmail };
