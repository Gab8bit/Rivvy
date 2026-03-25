import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('incorpora')
		.setDescription('Invia un messaggio incorporato personalizzato')
        .addStringOption(option =>
            option.setName('titolo')
                .setRequired(true)
                .setDescription('Titolo del messaggio'))
		.addStringOption(option =>
            option.setName('descrizione')
				.setRequired(true)
                .setDescription('Descrizione del messaggio'))
		.addStringOption(option =>
            option.setName('colore')
                .setDescription('Colore del messaggio')
				.setRequired(true)
				.addChoices(
					{name: 'Rosso', value: 'red'},
					{name: 'Giallo', value: 'yellow'},
					{name: 'Blu', value: 'blue'},
					{name: 'Arancione', value: 'orange'},
					{name: 'Verde', value: 'green'},
					{name: 'Violetto', value: 'violet'},
					{name: 'Rosso-Arancione', value: 'redorange'},
					{name: 'Giallo-Arancione', value: 'yelloworange'},
					{name: 'Giallo-Verde', value: 'yellowgreen'},
					{name: 'Blu-Verde', value: 'bluegreen'},
					{name: 'Blu-Violetto', value: 'blueviolet'},
					{name: 'Rosso-Violetto', value: 'redviolet'},
				)),
	async execute(interaction) {
		var coloremb;
		switch(interaction.options.get('colore').value){
			case 'red':
				coloremb = '#FF0000'
				break;
			case 'yellow':
				coloremb = '#FFFF00'
				break;
			case 'blue':
				coloremb = '#0000FF'
				break;
			case 'orange':
				coloremb = '#FFA500'
				break;
			case 'green':
				coloremb = '#00FF00'
				break;
			case 'violet':
				coloremb = '#8F00FF'
				break;
			case 'redorange':
				coloremb = '#ff5349'
				break;
			case 'yelloworange':
				coloremb = '#FFAE42'
				break;
			case 'yellowgreen':
				coloremb = '#9ACD32'
				break;
			case 'bluegreen':
				coloremb = '#0D98BA'
				break;
			case 'blueviolet':
				coloremb = '#8A2BE2'
				break;
			case 'redviolet':
				coloremb = '#922b3e'
				break;
		}

		const embedembed = new EmbedBuilder()
				.setTitle(interaction.options.get('titolo').value)
				.setDescription(interaction.options.get('descrizione').value)
				.setColor(coloremb)
		interaction.deferReply();
		interaction.deleteReply();
		interaction.channel.send({ embeds: [embedembed] });
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /incorpora titolo: ${interaction.options.get('titolo').value} DESC: ${interaction.options.get('descrizione').value} COLOR: ${interaction.options.get('colore').value}`);
	},
};