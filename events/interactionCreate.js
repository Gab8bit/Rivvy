import { Events } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`[${now()} ERROR] interactionCreate.js: ${interaction.user.tag} invoked ${interaction.commandName} but the command does not exist!`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`[${now()} CRITICAL] interactionCreate.js: ${interaction.user.tag} invoked ${interaction.commandName} but the command FAILED during execution!`);
			console.error(error);
            await interaction.reply({ content: "A zì non te posso risponde perchè sto pezzo del codice mio non funziona. Riprova oppure aspetta il prossimo update!", ephemeral: true });
		}
	},
};