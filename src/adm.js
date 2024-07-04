const debug = require('debug')('bot:adm');
const getGroupAdmins = (groupMetadata) => {
    let admins = [];
    for (let participant of groupMetadata.participants) {
        if (participant.admin === 'admin' || participant.admin === 'superadmin') {
            admins.push(participant.id);
        }
    }
    return admins;
};

const isGroupAdmin = (groupAdmins, userId) => {
    return groupAdmins.includes(userId);
};

const botIsAdmin = (groupMetadata, botNumber) => {
    return groupMetadata.participants.some(participant => participant.id === botNumber && (participant.admin === 'admin' || participant.admin === 'superadmin'));
};

const banUser = async (sock, msg) => {
    const groupId = msg.key.remoteJid;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const groupMetadata = await sock.groupMetadata(groupId);

    if (!botIsAdmin(groupMetadata, botNumber)) {
        await sock.sendMessage(groupId, { text: '*Eu preciso ser admin.*' }, { quoted: msg });
        return;
    }

    const groupAdmins = getGroupAdmins(groupMetadata);
    const isAdmin = isGroupAdmin(groupAdmins, msg.key.participant);

    if (!isAdmin) {
        await sock.sendMessage(groupId, { text: '*Apenas admins podem usar esse comando.*' }, { quoted: msg });
        return;
    }

    let mentionedJid = [];
    if (msg.message.extendedTextMessage) {
        const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            mentionedJid = mentioned;
        } else {
            const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quotedMessage) {
                mentionedJid = [msg.message.extendedTextMessage.contextInfo.participant];
            }
        }
    }

    if (mentionedJid.length === 0) {
        await sock.sendMessage(groupId, { text: '*Marque o usuário que deseja banir.*' }, { quoted: msg });
        return;
    }

    for (const jid of mentionedJid) {
        await sock.groupParticipantsUpdate(groupId, [jid], 'remove');
    }
};

const addUser = async (sock, from, argument, msg) => {
    const groupMetadata = await sock.groupMetadata(from);
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!botIsAdmin(groupMetadata, botNumber)) {
        await sock.sendMessage(from, { text: '*Eu preciso ser admin.*' }, { quoted: msg });
        return;
    }

    const groupAdmins = getGroupAdmins(groupMetadata);
    const isAdmin = isGroupAdmin(groupAdmins, msg.key.participant);

    if (!isAdmin) {
        await sock.sendMessage(from, { text: '*Apenas admins podem usar esse comando.*' }, { quoted: msg });
        return;
    }

    let user = argument.replace(/[\s\+\-]/g, '');

    if (!user.endsWith('@s.whatsapp.net')) {
        user += '@s.whatsapp.net';
    }

    try {
        await sock.groupParticipantsUpdate(from, [user], 'add');
        await sock.sendMessage(from, { text: '*Usuário adicionado com sucesso.*' }, { quoted: msg });
    } catch (error) {
        await sock.sendMessage(from, { text: `*Erro ao adicionar usuário:* ${error.message}` }, { quoted: msg });
    }
};

const promoteUser = async (sock, msg) => {
    const groupId = msg.key.remoteJid;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const groupMetadata = await sock.groupMetadata(groupId);

    if (!botIsAdmin(groupMetadata, botNumber)) {
        await sock.sendMessage(groupId, { text: '*Eu preciso ser admin.*' }, { quoted: msg });
        return;
    }

    const groupAdmins = getGroupAdmins(groupMetadata);
    const isAdmin = isGroupAdmin(groupAdmins, msg.key.participant);

    if (!isAdmin) {
        await sock.sendMessage(groupId, { text: '*Apenas admins podem usar esse comando.*' }, { quoted: msg });
        return;
    }

    let mentionedJid = [];
    if (msg.message.extendedTextMessage) {
        const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            mentionedJid = mentioned;
        } else {
            const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quotedMessage) {
                mentionedJid = [msg.message.extendedTextMessage.contextInfo.participant];
            }
        }
    }

    if (mentionedJid.length === 0) {
        await sock.sendMessage(groupId, { text: '*Marque o usuário que deseja promover.*' }, { quoted: msg });
        return;
    }

    for (const jid of mentionedJid) {
        await sock.groupParticipantsUpdate(groupId, [jid], 'promote');
    }
};

const demoteUser = async (sock, msg) => {
    const groupId = msg.key.remoteJid;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const groupMetadata = await sock.groupMetadata(groupId);

    if (!botIsAdmin(groupMetadata, botNumber)) {
        await sock.sendMessage(groupId, { text: '*Eu preciso ser admin.*' }, { quoted: msg });
        return;
    }

    const groupAdmins = getGroupAdmins(groupMetadata);
    const isAdmin = isGroupAdmin(groupAdmins, msg.key.participant);

    if (!isAdmin) {
        await sock.sendMessage(groupId, { text: '*Apenas admins podem usar esse comando.*' }, { quoted: msg });
        return;
    }

    let mentionedJid = [];
    if (msg.message.extendedTextMessage) {
        const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            mentionedJid = mentioned;
        } else {
            const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quotedMessage) {
                mentionedJid = [msg.message.extendedTextMessage.contextInfo.participant];
            }
        }
    }

    if (mentionedJid.length === 0) {
        await sock.sendMessage(groupId, { text: '*Marque o usuário que deseja rebaixar.*' }, { quoted: msg });
        return;
    }

    for (const jid of mentionedJid) {
        await sock.groupParticipantsUpdate(groupId, [jid], 'demote');
    }
};

module.exports = { banUser, addUser, promoteUser, demoteUser };
