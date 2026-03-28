import { SlashCommandBuilder, EmbedBuilder, escapeMarkdown, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { now } from '../utils/time.js';
import { addTransaction, getMoney, updateMoney } from '../utils/db_oper.js';
import { formatNumber, formatTime } from '../utils/formatting.js';

async function checkMoney(user, bet){
    const availableMoney = await getMoney(user);
    if(bet > availableMoney){
        return false;
    }
    return true;
}

export default {
    data: new SlashCommandBuilder()
        .setName('scommetti')
        .setDescription('Scommetti i tuoi pesci')
        .addStringOption(option =>
            option.setName('gioco')
            .setDescription('Scegli il gioco')
            .setRequired(true)
            .addChoices(
                {name: 'Rosso o blu', value: 'redblue'}
            ))
        .addIntegerOption(option =>
            option.setName('quantità')
            .setDescription('Quanti pesci vuoi scommettere?')
            .setRequired(true)
            .setMinValue(1)
        ),
    async execute(interaction) {
        const choice = interaction.options.get('gioco').value;
        const bet = interaction.options.get('quantità').value;
        const user = interaction.user.id;
        if(!await checkMoney(user, bet)){
            await interaction.reply({ content: `Non hai abbastanza pesci! Ne hai solo ${formatNumber(await getMoney(user))}.`, flags: MessageFlags.Ephemeral });
            console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti ${choice} ${bet} - Insufficient funds`);
        }else{
            if(choice == 'redblue'){
                const rosso_btn = new ButtonBuilder()
                    .setCustomId('rosso')
                    .setLabel('Rosso')
                    .setStyle(ButtonStyle.Danger);
                const blu_btn = new ButtonBuilder()
                    .setCustomId('blu')
                    .setLabel('Blu')
                    .setStyle(ButtonStyle.Primary);
                const row = new ActionRowBuilder()
                    .addComponents(rosso_btn, blu_btn);
                const response = await interaction.reply({
                    content: `**Hai scommesso ${formatNumber(bet)} pesci.**\nScegli, rosso o blu?`,
                    components: [row],
                    withResponse: true,
                });

                const collectorFilter = (i) => i.user.id === user;
                try{
                    const confirmation = await response.resource.message.awaitMessageComponent({filter: collectorFilter, time: 10000});
                    const bot_choice = Math.floor(Math.random() * 2); // 0 = blu  1 = rosso
                    if((confirmation.customId === 'blu' && bot_choice == 0)||(confirmation.customId === 'rosso' && bot_choice == 1)){
                        updateMoney(user,bet);
                        addTransaction(user, bet);
                        await confirmation.update({content: `🏆 Hai vinto ${formatNumber(bet)} pesci!`, components: []});
                        console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti ${choice} ${bet} - Win`);
                    }else{
                        updateMoney(user,bet*-1);
                        addTransaction(user, bet*-1);
                        await confirmation.update({content: `❌ Hai perso ${formatNumber(bet)} pesci cojone`, components: []});
                        console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti ${choice} ${bet} - Lost`);
                    }
                }catch (e){ 
                    await interaction.editReply({content: `Non hai risposto in tempo, ti ho ridato i soldi`, components: []});
                    console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti ${choice} ${bet} - Timed out`);
                }
            }
        }
    },
};