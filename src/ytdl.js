const debug = require('debug')('bot:adm');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const tempDir = 'temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const downloadVideo = async (sock, from, url) => {
    try {
        const info = await ytdl.getInfo(url);
        const videoLength = parseInt(info.videoDetails.lengthSeconds, 10);

        if (videoLength > 300) {
            await sock.sendMessage(from, { text: 'O vídeo deve ter no máximo 5 minutos.' });
            return;
        }

        const resolutions = [480, 360, 240, 144];
        let videoFormat = null;

        for (let resolution of resolutions) {
            videoFormat = info.formats.find(format => 
                format.container === 'mp4' && 
                format.codecs.startsWith('avc1') && 
                format.height === resolution &&
                format.audioCodec
            );
            if (videoFormat) break;
        }

        if (!videoFormat) {
            await sock.sendMessage(from, { text: 'Nenhum formato de vídeo adequado encontrado.' });
            return;
        }

        const videoPath = path.join(tempDir, `${info.videoDetails.videoId}.mp4`);
        const stream = ytdl.downloadFromInfo(info, { format: videoFormat });
        const fileStream = fs.createWriteStream(videoPath);

        stream.pipe(fileStream);

        fileStream.on('finish', async () => {
            await sock.sendMessage(from, { video: { url: videoPath }, caption: info.videoDetails.title });
            fs.unlinkSync(videoPath);
        });

        fileStream.on('error', async (err) => {
            console.error('File Stream Error:', err);
            await sock.sendMessage(from, { text: 'Erro ao salvar o vídeo no arquivo.' });
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        });

        stream.on('error', async (err) => {
            console.error('Stream Error:', err);
            await sock.sendMessage(from, { text: 'Erro ao fazer download do vídeo.' });
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        });
    } catch (error) {
        console.error('General Error:', error);
        await sock.sendMessage(from, { text: `Erro ao baixar o vídeo: ${error.message}` });
    }
};

const downloadAudio = async (sock, from, url) => {
    try {
        const info = await ytdl.getInfo(url);
        const videoLength = parseInt(info.videoDetails.lengthSeconds, 10);

        if (videoLength > 300) {
            await sock.sendMessage(from, { text: '*O áudio deve ter no máximo 5 minutos.*' });
            return;
        }

        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        if (!audioFormat) {
            throw new Error('Qualidade de áudio não disponível');
        }

        const audioPath = path.join(tempDir, `${info.videoDetails.videoId}.mp3`);
        const stream = ytdl.downloadFromInfo(info, { format: audioFormat });
        const fileStream = fs.createWriteStream(audioPath);

        stream.pipe(fileStream);

        fileStream.on('finish', async () => {
            await sock.sendMessage(from, { audio: { url: audioPath }, mimetype: 'audio/mpeg' });
            fs.unlinkSync(audioPath);
        });

        fileStream.on('error', async (err) => {
            console.error('File Stream Error:', err);
            await sock.sendMessage(from, { text: '*Erro ao salvar o áudio no arquivo.*' });
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }
        });

        stream.on('error', async (err) => {
            console.error('Stream Error:', err);
            await sock.sendMessage(from, { text: '*Erro ao fazer download do áudio.*' });
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }
        });
    } catch (error) {
        console.error('General Error:', error);
        await sock.sendMessage(from, { text: `*Erro ao baixar o áudio:* ${error.message}` });
    }
};

module.exports = { downloadVideo, downloadAudio };
