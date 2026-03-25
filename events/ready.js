import { Events } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`[${now()} INFO] bootstrap: Done! Logged in as ${client.user.tag}`);
	},
};
