// commands/stats.js
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { now } from '../utils/time.js';
import { getMoney, getMessageSum, getVCtime } from '../utils/db_oper.js';

function formatNumber(n) {
    return n.toLocaleString('it-IT');
}

function formatTime(secondi) {
    const gg  = Math.floor(secondi / 86400);
    const hh  = Math.floor((secondi % 86400) / 3600);
    const min = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;

    const parti = [];
    if (gg)  parti.push(`${gg}g`);
    if (hh)  parti.push(`${hh}h`);
    if (min) parti.push(`${min}m`);
    if (sec || parti.length === 0) parti.push(`${sec}s`);

    return parti.join(' ');
}

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Visualizza le tue statistiche'),

    async execute(interaction) {
        const userId = interaction.user.id;

        const messages = await getMessageSum(userId);
        const vctime = await getVCtime(userId);
        const money = await getMoney(userId);

        if (messages === -1 || vctime === -1) {
            return interaction.reply({ content: '❌ Non ho trovato nulla su di te zì, manda un messaggio o entra in VC così ti salvo!', flags: MessageFlags.Ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📊 Statistiche di ${interaction.user.username}`)
            .addFields(
                { name: '💬 Messaggi',    value: formatNumber(messages), inline: true },
                { name: '🎙️ Tempo in VC', value: formatTime(vctime),     inline: true },
                { name: '🪙 Soldi', value: formatNumber(money),     inline: true },
            )
            .setColor("#E69138")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: 'Le statistiche partono dal 24 marzo 2026.\nIl tempo in VC si aggiorna ogni volta che esci da un canale vocale.' });

        console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /stats`);
        return interaction.reply({ embeds: [embed] });
    },
};