import { Events } from 'discord.js';
import { now } from '../utils/time.js';
import { createUserIfNotExist, addVCtime, updateMoney, addTransaction, updateUsername } from '../utils/db_oper.js';

const activeSessions = {};

export default {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        const userId = newState.member?.user?.id;
        const username = newState.member?.user?.username;
        const isBot = newState.member?.user?.bot;
        const guildId = newState.guild?.id;
        if (!userId || !guildId || isBot) return;

        const entrato = !oldState.channelId && newState.channelId;
        const uscito = oldState.channelId && !newState.channelId;

        if (entrato) {
            activeSessions[`${guildId}_${userId}`] = Date.now();
            console.log(`[${now()} INFO] VcCounter.js: ${userId} joined VC`);
        }

        if (uscito) {
            const key = `${guildId}_${userId}`;
            if (!activeSessions[key]) return;

            const secondi = Math.floor((Date.now() - activeSessions[key]) / 1000);
            delete activeSessions[key];

            await createUserIfNotExist(userId);
            await updateUsername(userId, username);
            await addVCtime(userId, secondi);
            const guadagno = Math.min(secondi, 1800); //cap 1800 max
            await addTransaction(userId, guadagno);
            await updateMoney(userId, guadagno);

            console.log(`[${now()} INFO] VcCounter.js: ${userId} left VC — session: ${secondi}s`);
        }
    },
};