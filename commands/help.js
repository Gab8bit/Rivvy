import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { now } from '../utils/time.js';

const statuses = [
	"Hello World!",
	"Pisello Palle Piscio?",
	"Dove sta il piscio?",
	"ERRORE: Segmento di codice critico mancante! MOTIVO: Mangiato da ZiChecco",
	"Gugu gaga.",
	"Combattenti...",
	"I HATE NI-",
	"Sono sicuro al 100% che sei omosessuale",
	"CHECCO QUANTE UOVA HAI?!"
]

const comandiembed = new EmbedBuilder()
    .setColor('#E69138')
	.setTitle('Lista dei Comandi')
	.setURL('https://rivvybot.gab8bit.net/')
	.setDescription(`_${statuses[Math.floor(Math.random() * statuses.length)]}_`)
	.addFields(
    { name: "🖼️  /media", value: 'Invia una foto, un video o un audio da un archivio interno di file.\n\n' },
	{ name: "🎵  /musica", value: 'Riproduce in chat vocale un file audio caricato da te.\n\n' },
	{ name: "📊  /stats", value: 'Mostra le tue statistiche nel server.\nAccumula pesci stando in chat vocale o mandando messaggi e spendili giocando ai minigiochi!\n\n' },
	{ name: "🏆  /classifica", value: 'Mostra la classifica globale!\n\n' },
	{ name: "😂  /meme", value: 'Invia un meme o un post da un subreddit casuale o scelto da te.\n\n' },
	{ name: "🤫  /segreto", value: 'Usa questo comando per smascherare i segreti più intimi dei tuoi amici.\n\n' },
	{ name: "🛞  /ruota", value: 'Lascia che la fortuna scelga per te.\nDai delle opzioni e la ruota ne sceglierà una casualmente.\n\n' },
    { name: '🗣  /ripeti', value: 'Fai ripetere un messaggio a Rivvy. Semplice.\n\n' },
	{ name: '😮  /troll', value: 'Trolla una persona con dei comandi fake di kick e ban.\n\n' },
	{ name: '🔐  /password', value: 'Genera una nuova password sup3rs1kura!!!\n\n' },
    { name: '📃  /incorpora', value: 'Invia un messaggio incorporato.\nSolo i bot possono farlo, ora puoi anche tu!\n\n' }
	)
	.setFooter({ text: 'Made by Gab8bit with ❤️'})


export default {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Mostra tutti i comandi'),
	async execute(interaction) {
		await interaction.reply({ embeds: [comandiembed] });
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /help`);
	},
};