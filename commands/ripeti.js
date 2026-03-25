import { SlashCommandBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ripeti')
		.setDescription('Ripete un messaggio')
        .addStringOption(option =>
            option.setName('messaggio')
                .setRequired(true)
                .setDescription('Messaggio da ripetere')),
	async execute(interaction) {
		interaction.deferReply();
		interaction.deleteReply();
		interaction.channel.send(interaction.options.get('messaggio').value);
        console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /ripeti ${interaction.options.get('messaggio').value}`)
	},
};