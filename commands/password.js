import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('password')
		.setDescription('Genera una nuova password random')
		.addStringOption(option =>
			option.setName('tipo')
			.setDescription("Tipo di password")
			.setRequired(true)
			.addChoices(
				{name: 'Numerica', value: 'numbsonly'},
				{name: 'Alfanumerica', value: 'lettsandnumbs'},
				{name: 'Alfabetica', value: 'lettsonly'},
				{name: 'Solo caratteri speciali', value: 'spcharsonly'},
				{name: 'Tutto', value: 'allchars'}
			))
		.addIntegerOption(option => 
			option.setName('lunghezza')
			.setDescription("Lunghezza della password")
			.setRequired(true)
			.setMaxValue(256)
			.setMinValue(1)
			),
	async execute(interaction) {
		const numbers = "0123456789";
		const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const spchars = "!@#$%^&*()";
		const pswlength = interaction.options.get('lunghezza').value;
		if(interaction.options.get('tipo').value === 'numbsonly'){
			var password = "";
			for (var i = 0; i < pswlength; i++) {
				var randomNumber = Math.floor(Math.random() * numbers.length);
				password += numbers.substring(randomNumber, randomNumber +1);
			}
			await interaction.reply(`La tua nuova password è ||${password}||`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /password numbsonly ${pswlength}`);
		}else if(interaction.options.get('tipo').value === 'lettsonly'){
			var password = "";
			for (var i = 0; i < pswlength; i++) {
				var randomNumber = Math.floor(Math.random() * letters.length);
				password += letters.substring(randomNumber, randomNumber +1);
			}
			await interaction.reply(`La tua nuova password è ||${password}||`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /password lettsonly ${pswlength}`);
		}else if(interaction.options.get('tipo').value === 'spcharsonly'){
			var password = "";
			for (var i = 0; i < pswlength; i++) {
				var randomNumber = Math.floor(Math.random() * spchars.length);
				password += spchars.substring(randomNumber, randomNumber +1);
			}
			await interaction.reply(`La tua nuova password è ||${password}||`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /password spcharsonly ${pswlength}`);
		}else if(interaction.options.get('tipo').value === 'lettsandnumbs'){
			var password = "";
			var charset = letters + numbers;
			for (var i = 0; i < pswlength; i++) {
				var randomNumber = Math.floor(Math.random() * charset.length);
				password += charset.substring(randomNumber, randomNumber +1);
			}
			await interaction.reply(`La tua nuova password è ||${password}||`);
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /password lettsandnumbs ${pswlength}`);
		}else if(interaction.options.get('tipo').value === 'allchars'){
			var password = "";
			var charset = letters + numbers + spchars;
			for (var i = 0; i < pswlength; i++) {
				var randomNumber = Math.floor(Math.random() * charset.length);
				password += charset.substring(randomNumber, randomNumber +1);
			}
			await interaction.reply({ content: `La tua nuova password è ||${password}||`, flags: MessageFlags.Ephemeral });
			console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /password allchars ${pswlength}`);
		}
	},
};