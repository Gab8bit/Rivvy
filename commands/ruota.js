import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ruota')
		.setDescription('Lascia scegliere alla ruota della fortuna')
		.addStringOption(option =>
			option.setName('opzioni')
			.setDescription("Scrivi le opzioni possibili separate da una virgola")
			.setRequired(true)
			),
	async execute(interaction) {
		const optionsString = interaction.options.get('opzioni').value;
		var optionsArray = optionsString.split(",");
		const choice = optionsArray[Math.floor(Math.random() * optionsArray.length)];
		var optionsList = "";
		for(var i = 0; i < optionsArray.length; i++){
			var listNum = i + 1;
			optionsList = optionsList + listNum + ". " + optionsArray[i] + "\n";
		}
		const wheelEmbed = new EmbedBuilder()
    		.setColor('#E69138')
			.setTitle(`La ruota ha scelto!`)
			.setDescription(`Le tue opzioni:\n${optionsList}\n\n**Scelta della ruota:\n||${choice}||**\n`)
			.setTimestamp();
		await interaction.reply({ embeds: [wheelEmbed] });
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /ruota ${optionsString}`);
	},
};