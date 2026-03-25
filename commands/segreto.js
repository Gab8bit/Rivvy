import { SlashCommandBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('segreto')
		.setDescription('Scopri dei segreti sui tuoi amici')
		.addStringOption(option =>
			option.setName('cosa')
			.setDescription("Cosa vuoi sapere?")
			.setRequired(true)
			.addChoices(
				{name: 'Quanto è lungo il suo cazzo?', value: 'cazzolungo'},
				{name: 'Quanto è gay?', value: 'gay'},
				{name: 'Quanto è troia sua madre?', value: 'slutty'},
				{name: 'Quanto è terrone?', value: 'terrone'}
			))
			.addStringOption(option =>
				option.setName('chi')
				.setDescription('Tagga una persona')
				.setRequired(true)
				),
	async execute(interaction) {
		if(interaction.options.get('cosa').value === 'cazzolungo'){
			await interaction.reply(`Il cazzo di ${interaction.options.get('chi').value} è lungo ${Math.floor(Math.random() * 100)}cm`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /segreto cazzolungo`);
		}else if(interaction.options.get('cosa').value === 'gay'){
			await interaction.reply(`${interaction.options.get('chi').value} è il ${Math.floor(Math.random() * 100)}% gay 🌈`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /segreto gay`);
		}else if(interaction.options.get('cosa').value === 'slutty'){
			await interaction.reply(`La mamma di ${interaction.options.get('chi').value} è al ${Math.floor(Math.random() * 100)}% troia 💦`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /segreto slutty ${interaction.options.get('chi').value}`);
		}else if(interaction.options.get('cosa').value === 'terrone'){
			await interaction.reply(`${interaction.options.get('chi').value} è terrone al ${Math.floor(Math.random() * 100)}% 🐒`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /segreto terrone ${interaction.options.get('chi').value}`);
		}
	},
};