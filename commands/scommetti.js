import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { now } from '../utils/time.js';
import { addTransaction, getMoney, updateMoney } from '../utils/db_oper.js';
import { formatNumber } from '../utils/formatting.js';
import { handleBlackjack } from '../games/blackjackBuilder.js';
import { handleRedBlue } from '../games/RedBlueBuilder.js';

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
                {name: 'Rosso o blu', value: 'redblue'},
                {name: 'Blackjack', value: 'blackjack'}
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
                handleRedBlue(interaction, bet, user);
            }else if (choice === 'blackjack') {
                await handleBlackjack(interaction, bet, user);
            }
        }
    },
};