const debug = require('debug')('bot:util');
const fs = require('fs');
const path = require('path');

const userFilePath = path.join(__dirname, 'user.json');

const loadUsers = () => {
    if (!fs.existsSync(userFilePath)) {
        fs.writeFileSync(userFilePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(userFilePath));
};

const saveUser = (user) => {
    const users = loadUsers();
    if (!users.some(u => u.id === user.id)) {
        users.push(user);
        fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
    }
};

const sendMessageToAll = async (sock, message) => {
    const users = loadUsers();
    for (const user of users) {
        await sock.sendMessage(user.id, { text: `*Mensagem do Dev:*\n\n${message}` });
    }
};

module.exports = { saveUser, sendMessageToAll };
