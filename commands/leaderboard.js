import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { now } from '../utils/time.js';
import { getLeaderboard, getUserRank } from '../utils/db_oper.js';
import { formatNumber, formatTime } from '../utils/formatting.js';

export default {
	data: new SlashCommandBuilder()
		.setName('classifica')
		.setDescription('Visualizza la classifica globale')
		.addStringOption(option =>
			option.setName('cosa')
			.setDescription('Scegli quale classifica vuoi vedere')
			.setRequired(true)
			.addChoices(
				{name: 'Messaggi', value: 'messages'},
				{name: 'Tempo in VC', value: 'vctime'},
				{name: 'Pesci', value: 'money'}
			)),
	async execute(interaction) {
		const choice = interaction.options.get('cosa').value;
		const user = interaction.user.id;
		const position = await getUserRank(user, choice);
		var text = "";
		if(choice == "vctime"){
			const top3 = await getLeaderboard(3, choice);
			text = `**Classifica globale**
			🥇 ${top3[0].username} - ${formatTime(top3[0].result)}
			🥈 ${top3[1].username} - ${formatTime(top3[1].result)}
			🥉 ${top3[2].username} - ${formatTime(top3[2].result)}
			`;
		}else if(choice == "messages"){
			const top3 = await getLeaderboard(3, choice);
			text = `**Classifica globale**
			🥇 ${top3[0].username} - ${formatNumber(top3[0].result)} messaggi
			🥈 ${top3[1].username} - ${formatNumber(top3[1].result)} messaggi
			🥉 ${top3[2].username} - ${formatNumber(top3[2].result)} messaggi
			`;
		}else if(choice == "money"){
			const top3 = await getLeaderboard(3, choice);
			text = `**Classifica globale**
			🥇 ${top3[0].username} - ${formatNumber(top3[0].result)} pesci
			🥈 ${top3[1].username} - ${formatNumber(top3[1].result)} pesci
			🥉 ${top3[2].username} - ${formatNumber(top3[2].result)} pesci
			`;
		}
		const leaderboard = new EmbedBuilder()
    		.setColor('#E69138')
			.setTitle(`Sei #${position} in classifica!`)
			.setDescription(text)
		await interaction.reply({ embeds: [leaderboard] });
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /leaderboard ${interaction.options.get('cosa').value}`);
	},
};