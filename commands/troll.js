import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('troll')
		.setDescription('Trolla una persona')
		.addStringOption(option =>
			option.setName('quale')
			.setDescription("Seleziona un troll")
			.setRequired(true)
			.addChoices(
				{name: 'Fake Ban', value: 'ban'},
				{name: 'Fake Kick', value: 'kick'}
			))
			.addStringOption(option =>
				option.setName('chi')
				.setDescription('Menziona una persona')
				.setRequired(true)
				),
	async execute(interaction) {
		if(interaction.options.get('quale').value === 'ban'){
			const embedtroll = new EmbedBuilder()
				.setDescription(interaction.options.get('chi').value + " è stato bannato!")
				.setColor("#ed0e0e")
            await interaction.reply({ embeds: [embedtroll] });
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /troll ban ` + interaction.options.get('chi').value);
		}else if(interaction.options.get('quale').value === 'kick'){
			const embedtroll = new EmbedBuilder()
				.setDescription(interaction.options.get('chi').value + " è stato espulso!")
				.setColor("#ed0e0e")
            await interaction.reply({ embeds: [embedtroll] });
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /troll kick ` + interaction.options.get('chi').value);
		}
	},
};