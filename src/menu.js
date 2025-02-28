const debug = require('debug')('bot:menu');
const { botName, prefix, dev, nDev, botFoto, admin } = require('./info');

const showMenu = async (sock, from, quotedMsg) => {
    const menuText = `
┌──────────────────────────
| - *Prefixo: ${prefix}*
| - *Dev: ${dev}*
|
| - *Comandos gerais:*
|
| - *${prefix}vid <link>:*
|   > Baixa vídeo do YouTube (máximo 5 minutos)
| - *${prefix}aud <link>:*
|   > Baixa áudio do YouTube (máximo 5 minutos)
| - *${prefix}s ou ${prefix}sticker ou ${prefix}fig:*
|   > Converte mídia em figurinha
| - *${prefix}play <nome>:*
|   > Baixa áudio do YouTube
| - *${prefix}encurta <url>:*
|   > Encurta uma URL
| - *${prefix}menu:*
|   > Mostra este menu
|
| - *Comandos de IA*
|
| - *${prefix}gem <mensagem>:*
|   > Obtém resposta da Gemini
| - *${prefix}gpt <mensagem>:*
|   > Obtém resposta do ChatGPT
| - *${prefix}img <prompt>:*
|   > Gera imagem usando IA
|
| - *Comandos de administração:*
|
| - *${prefix}ban @usuario ou citando uma mensagem:*
|   > Bane usuário do grupo
| - *${prefix}adm @usuario:*
|   > Promove a administrador
| - *${prefix}reb @usuario:*
|   > Rebaixa a membro comum
| - *${prefix}add <número>:*
|   > Adiciona usuário ao grupo
| 
| - ® *${botName}* ™
└──────────────────────────
`;

    await sock.sendMessage(from, {
        image: { url: `${botFoto}` },
        caption: menuText,
        quoted: quotedMsg
    });
};

module.exports = { showMenu };
	
