import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { updateMoney, addTransaction } from "../utils/db_oper.js";
import { formatNumber } from "../utils/formatting.js";
import { now } from "../utils/time.js";
import { calculateHandValue, formatHand, hasActiveGame, createGame, isNaturalBlackjack, endGame, playerHit, resolveGame, getGame, dealerPlay } from "./blackjackManager.js";

function buildBlackjackRow() {
    const hitBtn = new ButtonBuilder()
        .setCustomId('bj_hit')
        .setLabel('🃏 Carta')
        .setStyle(ButtonStyle.Primary);
 
    const standBtn = new ButtonBuilder()
        .setCustomId('bj_stand')
        .setLabel('✋ Stai')
        .setStyle(ButtonStyle.Secondary);
 
    return new ActionRowBuilder().addComponents(hitBtn, standBtn);
}

function buildGameEmbed(game) {
    const playerValue = calculateHandValue(game.playerHand);
    return new EmbedBuilder()
        .setTitle('🃏 Blackjack')
        .setColor(0x2b2d31)
        .addFields(
            {
                name: '🎴 Tu',
                value: formatHand(game.playerHand),
                inline: false,
            },
            {
                name: '🤵 Dealer',
                value: formatHand(game.dealerHand, true), // nasconde seconda carta
                inline: false,
            }
        )
        .setFooter({ text: `Hai puntato ${formatNumber(game.bet)} pesci` });
}
 
function buildResultEmbed(game, result, playerValue, dealerValue, payout) {
    let color, title, desc;
 
    if (result === 'win') {
        color = 0x57f287;
        title = '🏆 Hai vinto!';
        desc = `+${formatNumber(Math.abs(payout))} pesci`;
    } else if (result === 'lose') {
        color = 0xed4245;
        title = '❌ Hai perso cojone';
        desc = `-${formatNumber(Math.abs(payout))} pesci`;
    } else {
        color = 0xfee75c;
        title = '🤝 Pareggio';
        desc = 'Nessun pesce perso o guadagnato';
    }
 
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setColor(color)
        .addFields(
            {
                name: '🎴 Tu',
                value: formatHand(game.playerHand),
                inline: true,
            },
            {
                name: '🤵 Dealer',
                value: formatHand(game.dealerHand), // ora mostra tutto
                inline: true,
            },
            {
                name: '\u200b',
                value: `Tu: **${playerValue}** — Dealer: **${dealerValue}**`,
                inline: false,
            }
        );
}

export async function handleBlackjack(interaction, bet, user) {
    // Evita partite doppie
    if (hasActiveGame(user)) {
        await interaction.reply({
            content: '⚠️ Hai già una partita di blackjack in corso! Finiscila prima.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
 
    // Crea la partita e salva lo stato nel manager
    const game = createGame(user, bet);
 
    // Blackjack naturale?
    if (isNaturalBlackjack(user)) {
        const payout = Math.floor(bet * 1.5); // blackjack paga 3:2
        updateMoney(user, payout);
        addTransaction(user, payout);
        endGame(user);
 
        const embed = new EmbedBuilder()
            .setTitle('🃏 BLACKJACK NATURALE!')
            .setDescription(`+${formatNumber(payout)} pesci (paga 3:2)`)
            .setColor(0xf1c40f)
            .addFields({
                name: '🎴 Tu',
                value: formatHand(game.playerHand),
            });
 
        await interaction.reply({ embeds: [embed] });
        console.log(`[${now()} INFO] ${interaction.user.tag} /scommetti blackjack ${bet} - Natural Blackjack`);
        return;
    }
 
    // Inizio
    const embed = buildGameEmbed(game, user);
    const row = buildBlackjackRow();
 
    const response = await interaction.reply({
        embeds: [embed],
        components: [row],
        withResponse: true,
    });
 
    // ── Loop di gioco ─────────────────────────
    // Usiamo un loop con awaitMessageComponent ripetuto
    // finché il giocatore non sta, sfora, o timeout
 
    const collectorFilter = (i) => i.user.id === user;
    let playing = true;
 
    while (playing) {
        let confirmation;
        try {
            confirmation = await response.resource.message.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000, // 60 secondi per ogni mossa
            });
        } catch {
            // Timeout
            endGame(user);
            await interaction.editReply({
                content: '⏱️ Hai impiegato troppo, partita annullata. Pesci restituiti.',
                embeds: [],
                components: [],
            });
            console.log(`[${now()} INFO] ${interaction.user.tag} /scommetti blackjack ${bet} - Timed out`);
            return;
        }
 
        if (confirmation.customId === 'bj_hit') {
            // ── HIT: pesca una carta ──
            const { playerHand, value } = playerHit(user);
 
            if (value > 21) {
                // Bust! Perde subito
                playing = false;
                const { result, playerValue, dealerValue, payout } = resolveGame(user);
                updateMoney(user, payout);
                addTransaction(user, payout);
 
                const resultEmbed = buildResultEmbed(
                    getGame(user) ?? game,
                    result,
                    playerValue,
                    dealerValue,
                    payout
                );
                endGame(user);
 
                await confirmation.update({ embeds: [resultEmbed], components: [] });
                console.log(`[${now()} INFO] ${interaction.user.tag} /scommetti blackjack ${bet} - Bust (${value})`);
            } else if (value === 21) {
                // 21 esatto → stand automatico
                playing = false;
                dealerPlay(user);
                const currentGame = getGame(user);
                const { result, playerValue, dealerValue, payout } = resolveGame(user);
                updateMoney(user, payout);
                addTransaction(user, payout);
 
                const resultEmbed = buildResultEmbed(currentGame, result, playerValue, dealerValue, payout);
                endGame(user);
 
                await confirmation.update({ embeds: [resultEmbed], components: [] });
                console.log(`[${now()} INFO] ${interaction.user.tag} /scommetti blackjack ${bet} - 21 auto-stand`);
            } else {
                // Continua → aggiorna embed con nuova carta
                const updatedGame = getGame(user);
                const updatedEmbed = buildGameEmbed(updatedGame, user);
                await confirmation.update({ embeds: [updatedEmbed], components: [row] });
            }
        } else if (confirmation.customId === 'bj_stand') {
            // ── STAND: il dealer gioca ──
            playing = false;
            dealerPlay(user);
            const currentGame = getGame(user);
            const { result, playerValue, dealerValue, payout } = resolveGame(user);
            updateMoney(user, payout);
            addTransaction(user, payout);
 
            const resultEmbed = buildResultEmbed(currentGame, result, playerValue, dealerValue, payout);
            endGame(user);
 
            await confirmation.update({ embeds: [resultEmbed], components: [] });
            console.log(
                `[${now()} INFO] ${interaction.user.tag} /scommetti blackjack ${bet} - ${result} (player: ${playerValue}, dealer: ${dealerValue})`
            );
        }
    }
}