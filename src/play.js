const debug = require('debug')('bot:play');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

const downloadAudio = async (sock, from, query) => {
    try {
        const results = await yts(query);
        const video = results.videos[0];
        if (!video) {
            await sock.sendMessage(from, { text: '*Nenhum vídeo encontrado.*' });
            return;
        }

        const { title, url } = video;
        const audioPath = path.join(tmpdir(), `${title}.mp3`);

        const audioStream = ytdl(url, { filter: 'audioonly' });
        const fileStream = fs.createWriteStream(audioPath);
        audioStream.pipe(fileStream);

        fileStream.on('finish', async () => {
            const audioBuffer = fs.readFileSync(audioPath);
            await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mp4' });
            fs.unlinkSync(audioPath);
        });

        audioStream.on('error', async (error) => {
            console.error(error);
            await sock.sendMessage(from, { text: '*Ocorreu um erro ao baixar o áudio.*' });
        });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(from, { text: '*Ocorreu um erro ao buscar.*' });
    }
};

module.exports = { downloadAudio };
