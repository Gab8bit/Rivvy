import { SlashCommandBuilder, EmbedBuilder, escapeMarkdown } from 'discord.js';
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
		const medals = ['🥇', '🥈', '🥉'];
		const formatValue = {
			vctime:   (r) => formatTime(r),
			messages: (r) => `${formatNumber(r)} messaggi`,
			money:    (r) => `${formatNumber(r)} pesci`,
		};
		let text = '**Classifica globale**\n';
		if (formatValue[choice]) {
			const top = await getLeaderboard(100, choice);
			top.forEach((entry, i) => {
				const prefix = medals[i] ?? `**#${i + 1}**`;
				const username = escapeMarkdown(entry.username ?? 'Utente sconosciuto');
				text += `${prefix} ${username} - ${formatValue[choice](entry.result)}\n`;
			});
		}
		const leaderboard = new EmbedBuilder()
			.setColor('#E69138')
			.setTitle(`Sei #${position} in classifica!`)
			.setDescription(text);
		await interaction.reply({ embeds: [leaderboard] });
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /leaderboard ${interaction.options.get('cosa').value}`);
	},
};