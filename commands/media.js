import { SlashCommandBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('media')
		.setDescription('Invia una foto, un video o un audio in chat')
		.addStringOption(option =>
			option.setName('nome')
			.setDescription('Nome del media')
			.setRequired(true)
			.addChoices(
				{name: 'Sus', value: 'sus'},
				{name: 'GTA', value: 'gta'},
				{name: 'Arab Funny', value: 'arabfunny'},
				{name: 'Shrek', value: 'shrek'},
				{name: 'Shrek Dance', value: 'shrekdance'},
				{name: 'Amogus', value: 'amogus'},
				{name: 'RickRoll', value: 'rickroll'}
			)),
	async execute(interaction) {
		if(interaction.options.get('nome').value === 'sus'){
			await interaction.reply({ files: ["./images/amogus.gif"] });
		}else if(interaction.options.get('nome').value === 'gta'){
			await interaction.reply({ files: ["./images/gta.gif"] });
		}else if(interaction.options.get('nome').value === 'arabfunny'){
			await interaction.reply({ files: ["./images/arabfunny.mp4"] });
		}else if(interaction.options.get('nome').value === 'shrek'){
			await interaction.reply({ files: ["./images/shrek.jpg"] });
		}else if(interaction.options.get('nome').value === 'shrekdance'){
			await interaction.reply({ files: ["./images/shrekdance.gif"] });
		}else if(interaction.options.get('nome').value === 'amogus'){
			await interaction.reply({ files: ["./songs/amogus.mp3"] });
		}else if(interaction.options.get('nome').value === 'rickroll'){
			await interaction.reply({ files: ["./songs/beautiful_song.mp3"] });
		}
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /media ${interaction.options.get('nome').value}`);
	},
};