import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { now } from '../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Invia un meme random da Reddit')
        .addStringOption(option =>
            option.setName('subreddit')
                .setRequired(false)
                .setDescription('[Opzionale] Scegli il subreddit in cui cercare')),
	async execute(interaction) {
		await interaction.deferReply(); // evitiamo timeout
        var coloremb = "#FFA500";
        var subreddit = "";
        try{
            subreddit = interaction.options.get('subreddit').value;
        }catch{}
        var fetch_url = "https://meme-api.com/gimme"
        var post_title = "";
        var post_ups = "";
        var post_author = "";
        var post_url = "";
        var post_image_url = "";
        var embedembed;
        if(subreddit != null || subreddit != ""){
            fetch_url = fetch_url + "/"+ encodeURIComponent(subreddit);
        }
        try {
            const res = await fetch(fetch_url);
            const data = await res.json();
            post_title = data.title;
            post_author = data.author;
            post_ups = data.ups;
            subreddit = data.subreddit;
            post_url = data.postLink;
            post_image_url = data.url;
            embedembed = new EmbedBuilder()
				.setTitle(post_title)
				.setURL(post_url)
                .setImage(post_image_url)
				.setColor(coloremb)
                .setFooter({text: `r/${subreddit} • 👍 ${post_ups} • Autore: ${post_author}`});
        } catch (err) {
            console.error(`[${now()} ERROR] meme.js: Error fetching meme! Command invoked by ${interaction.user.tag}`);
            embedembed = new EmbedBuilder()
				.setDescription("A zì hanno rubato il meme. So andato a cercà ma non ho trovato nulla.\nSei sicuro che il subreddit che mi hai detto esiste?")
				.setColor(coloremb)
        }
        interaction.deleteReply();
		interaction.channel.send({ embeds: [embedembed] });
		console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /meme ${subreddit}`)
	},
};