import {SlashCommandBuilder, EmbedBuilder, MessageFlags} from 'discord.js';
import {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus} from '@discordjs/voice';
import https from 'https';
import { now } from '../utils/time.js';

// ===== MAP GLOBALE PER MULTISERVER=====
const sessions = new Map();

export default {
	data: new SlashCommandBuilder()
		.setName('musica')
		.setDescription('Entra in VC e mette la musica che gli dai tu')
		.addSubcommand(sub => sub
			.setName("play")
			.setDescription('Riproduce un file audio')
			.addAttachmentOption(att => att
				.setName("audio")
				.setDescription("File audio da riprodurre")
				.setRequired(true)
			)
		)
		.addSubcommand(sub => sub
			.setName("stop")
			.setDescription("Ferma la musica")
		),
	async execute(interaction) {
		await interaction.deferReply();
		const sub = interaction.options.getSubcommand();
		const guildId = interaction.guildId;
		const channel = interaction.member.voice.channel;
		// ==== CONTROLLO SE IN VC ====
		if(channel){
			//check opzioni
			if(sub === "play"){
				const audio = interaction.options.getAttachment('audio');
				if (!audio || !audio.contentType?.startsWith('audio/')) {
					await interaction.editReply({
						content: 'Zio? Il file che mi hai mandato non è un audio!',
						flags: MessageFlags.Ephemeral
					});
				}else{
					//build embed
					const embedplay = new EmbedBuilder()
						.setDescription(`🎶 Riproduco **${audio.name}**`)
						.setColor("#E69138")
						.setFooter({text: `Richiesto da ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL()})
					//check riproduzione in questo server → se si, stop
					if (sessions.has(guildId)) {
						const old = sessions.get(guildId);
						old.player.stop(true);
						old.connection.destroy();
						sessions.delete(guildId);
					}
					//entra in vc
					const connection = joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
						selfDeaf: true
					});
					const player = createAudioPlayer();
					//error handling
					player.on('error', err => {
						console.error(`[${now()} ERROR] musica.js: Player Error [${guildId}]. Invoked by ${interaction.user.tag}`, err);
					});
					connection.on('error', err => {
						console.error(`[${now()} ERROR] musica.js: VoiceChat Error [${guildId}]. Invoked by ${interaction.user.tag}`, err);
					});
					https.get(audio.url, res => {
						res.on('error', console.error);
						//se nessun errore, entra in VC
						const resource = createAudioResource(res);
						player.play(resource);
						connection.subscribe(player);
					});
					//cleanup automatico a fine traccia
					player.on(AudioPlayerStatus.Idle, () => {
						player.stop();
						connection.destroy();
						sessions.delete(guildId);
					});
					//salva sessione
					sessions.set(guildId, { player, connection });
					//invia embed
					await interaction.editReply({ embeds: [embedplay] });
				}
			}else if(sub === "stop"){
				if (!sessions.has(guildId)) {
					await interaction.editReply({
						content: 'Non sto riproducendo nulla 🤷‍♂️',
						flags: MessageFlags.Ephemeral
					});
				}else{
					const { player, connection } = sessions.get(guildId);
					//STOP sicuro del player
  					if (player.state.status !== 'destroyed') player.stop(true);
					//DESTROY sicuro della connection
					if (connection.state.status !== 'destroyed') connection.destroy();
					sessions.delete(guildId);
					const embedstop = new EmbedBuilder()
						.setDescription('⏹️ Musica fermata')
						.setColor('#E69138')
						.setFooter({
							text: `Richiesto da ${interaction.member.displayName}`,
							iconURL: interaction.user.displayAvatarURL()
						});
					await interaction.editReply({ embeds: [embedstop] });
				}
			}
		}else await interaction.editReply({
			content: 'Devi prima entrare in un canale vocale!',
			flags: MessageFlags.Ephemeral
		});
        console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /musica ${sub}`)
	},
};