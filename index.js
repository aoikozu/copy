// 必要なモジュールのインポート
const { Client, GatewayIntentBits } = require('discord.js');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const crypto = require('crypto');

// Botインスタンスの作成
const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});
const client = new textToSpeech.TextToSpeechClient();
let verificationCodes = {};

// 認証機能
bot.on('guildMemberAdd', async (member) => {
    const code = crypto.randomBytes(4).toString('hex');
    verificationCodes[member.id] = code;

    try {
        await member.send(`Welcome! Your verification code is: ${code}`);
    } catch (err) {
        console.log('Failed to send DM:', err);
    }
});

bot.on('messageCreate', (message) => {
    if (message.channel.type === 'DM' && verificationCodes[message.author.id]) {
        if (message.content === verificationCodes[message.author.id]) {
            const guild = bot.guilds.cache.first();
            const member = guild.members.cache.get(message.author.id);
            const role = guild.roles.cache.find(role => role.name === 'Verified');

            member.roles.add(role).then(() => {
                message.reply('You have been verified!');
                delete verificationCodes[message.author.id];
            }).catch(console.error);
        } else {
            message.reply('Incorrect verification code.');
        }
    }

    // 読み上げ機能
    if (message.content.startsWith('!read ')) {
        const text = message.content.slice(6);
        
        const request = {
            input: { text },
            voice: { languageCode: 'ja-JP', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };
        
        client.synthesizeSpeech(request).then(async ([response]) => {
            const writeFile = util.promisify(fs.writeFile);
            await writeFile('output.mp3', response.audioContent, 'binary');
            console.log('Audio content written to file: output.mp3');

            const voiceChannel = message.member.voice.channel;
            if (voiceChannel) {
                playAudio(voiceChannel);
            } else {
                message.reply('You need to join a voice channel first.');
            }
        }).catch(console.error);
    }
});

async function playAudio(voiceChannel) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource('output.mp3');
    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });
}

// Botをログイン
bot.login('YOUR_BOT_TOKEN');
