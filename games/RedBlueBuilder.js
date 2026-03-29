import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { updateMoney, addTransaction } from "../utils/db_oper.js";
import { formatNumber } from "../utils/formatting.js";
import { now } from "../utils/time.js";

function buildButtons(){
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
    return row;
}

export async function handleRedBlue(interaction, bet, user){
    const response = await interaction.reply({
        content: `**Hai scommesso ${formatNumber(bet)} pesci.**\nScegli, rosso o blu?`,
        components: [buildButtons()],
        withResponse: true
        }
    );
    const collectorFilter = (i) => i.user.id === user;
    try{
        const confirmation = await response.resource.message.awaitMessageComponent({filter: collectorFilter, time: 30000});
        const bot_choice = Math.floor(Math.random() * 2); // 0 = blu  1 = rosso
        if((confirmation.customId === 'blu' && bot_choice == 0)||(confirmation.customId === 'rosso' && bot_choice == 1)){
            updateMoney(user,bet);
            addTransaction(user, bet);
            await confirmation.update({content: `🏆 Hai vinto ${formatNumber(bet)} pesci!`, components: []});
            console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti redblue ${bet} - Win`);
        }else{
            updateMoney(user,bet*-1);
            addTransaction(user, bet*-1);
            await confirmation.update({content: `❌ Hai perso ${formatNumber(bet)} pesci cojone`, components: []});
            console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti redblue ${bet} - Lost`);
        }
    }catch (e){ 
        await interaction.editReply({content: `Non hai risposto in tempo, ti ho ridato i soldi`, components: []});
        console.log(`[${now()} INFO] command-invoker: ${interaction.user.tag} invoked /scommetti redblue ${bet} - Timed out`);
    }
}