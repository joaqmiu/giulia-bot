const debug = require('debug')('bot:stk');
const ffmpeg = require('fluent-ffmpeg');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

const convertToSticker = async (mediaPath, outputPath, isVideo) => {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(mediaPath)
            .outputOptions(['-vf', 'scale=512:512:force_original_aspect_ratio=decrease'])
            .toFormat('webp')
            .on('end', () => resolve(outputPath))
            .on('error', reject);

        if (isVideo) {
            command = ffmpeg(mediaPath)
                .outputOptions([
                    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:-1:-1:color=white@0.0',
                    '-loop', '0',
                    '-ss', '0',
                    '-t', '8',
                    '-preset', 'default',
                    '-an',
                    '-vsync', '0',
                    '-s', '512:512'
                ])
                .addOutputOptions([
                    '-vcodec', 'libwebp',
                    '-lossless', '1',
                    '-qscale', '80',
                    '-compression_level', '6',
                    '-quality', '50',
                    '-preset', 'picture',
                    '-loop', '0',
                    '-an',
                    '-vsync', '0',
                    '-fs', '1M'
                ])
                .toFormat('webp');
        }

        command.save(outputPath);
    });
};

const handleSticker = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const message = msg.message;

    if (!message) {
        await sock.sendMessage(from, { text: '*Nenhuma mídia foi encontrada.*' });
        return;
    }

    const mediaType = message.imageMessage ? 'image' : message.videoMessage ? 'video' : null;
    if (!mediaType) {
        await sock.sendMessage(from, { text: '*Envie uma imagem ou vídeo para criar uma figurinha.*' });
        return;
    }

    const media = message.imageMessage || message.videoMessage;
    const mediaBuffer = await downloadMediaMessage(msg, 'buffer');
    const mediaPath = path.join(tmpdir(), `media.${mediaType === 'image' ? 'jpg' : 'mp4'}`);
    fs.writeFileSync(mediaPath, mediaBuffer);

    const outputPath = path.join(tmpdir(), 'sticker.webp');

    try {
        await convertToSticker(mediaPath, outputPath, mediaType === 'video');
        const stickerBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(from, { sticker: stickerBuffer });
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(outputPath);
    } catch (error) {
        await sock.sendMessage(from, { text: '*Ocorreu um erro ao criar a figurinha.*' });
        console.error(error);
    }
};

module.exports = { handleSticker };
