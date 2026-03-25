// events/messageCounter.js
import { Events } from 'discord.js';
import { now } from '../utils/time.js';
import { addTransaction, createUserIfNotExist, incrementMessages, updateMoney, updateUsername } from '../utils/db_oper.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guildId) return;

        await createUserIfNotExist(message.author.id);
        await updateUsername(message.author.id, message.author.username);
        await incrementMessages(message.author.id);
        await addTransaction(message.author.id, 1);
        await updateMoney(message.author.id, 1);
        console.log(`[${now()} INFO] messageCounter.js: Added +1 to ${message.author.id}`)
    },
};