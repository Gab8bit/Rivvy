const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Crea un mazzo standard da 52 carte mescolato
 * @returns {Array<{rank: string, suit: string}>}
 */
export function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ rank, suit });
        }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

/**
 * Pesca una carta dal mazzo (modifica il mazzo in-place)
 * @param {Array} deck
 * @returns {{rank: string, suit: string}}
 */
export function drawCard(deck) {
    return deck.pop();
}

/**
 * Calcola il valore di una mano di blackjack.
 * Gli assi valgono 11, e vengono abbassati a 1 se si sfora 21.
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {number}
 */
export function calculateHandValue(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.rank === 'A') {
            aces++;
            total += 11;
        } else if (['J', 'Q', 'K'].includes(card.rank)) {
            total += 10;
        } else {
            total += parseInt(card.rank);
        }
    }

    // Abbassa gli assi da 11 a 1 finché non si sfora
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

/**
 * Formatta una mano come stringa leggibile, es: "A♠ 10♥ (21)"
 * @param {Array<{rank: string, suit: string}>} hand
 * @param {boolean} hideSecond - nasconde la seconda carta iniziale del dealer
 * @returns {string}
 */
export function formatHand(hand, hideSecond = false) {
    if (hideSecond && hand.length >= 2) {
        const visible = `${hand[0].rank}${hand[0].suit}`;
        return `${visible} 🂠 (?)`;
    }
    const cards = hand.map(c => `${c.rank}${c.suit}`).join(' ');
    const value = calculateHandValue(hand);
    return `${cards} **(${value})**`;
}

// ─────────────────────────────────────────────
// GESTIONE PARTITE ATTIVE
// Map<userId, GameState>
// GameState: { deck, playerHand, dealerHand, bet, messageId? }
// ─────────────────────────────────────────────

/** @type {Map<string, {deck: Array, playerHand: Array, dealerHand: Array, bet: number}>} */
const activeGames = new Map();

/**
 * Controlla se l'utente ha già una partita in corso
 * @param {string} userId
 * @returns {boolean}
 */
export function hasActiveGame(userId) {
    return activeGames.has(userId);
}

/**
 * Crea e salva una nuova partita per l'utente.
 * Distribuisce 2 carte al giocatore e 2 al dealer.
 * @param {string} userId
 * @param {number} bet
 * @returns {{ playerHand: Array, dealerHand: Array, deck: Array }}
 */
export function createGame(userId, bet) {
    const deck = createDeck();
    const playerHand = [drawCard(deck), drawCard(deck)];
    const dealerHand = [drawCard(deck), drawCard(deck)];

    const game = { deck, playerHand, dealerHand, bet };
    activeGames.set(userId, game);
    return game;
}

/**
 * Recupera la partita attiva di un utente
 * @param {string} userId
 * @returns {{ deck: Array, playerHand: Array, dealerHand: Array, bet: number } | undefined}
 */
export function getGame(userId) {
    return activeGames.get(userId);
}

/**
 * Aggiunge una carta alla mano del giocatore (HIT)
 * @param {string} userId
 * @returns {{ card: {rank: string, suit: string}, playerHand: Array, value: number }}
 */
export function playerHit(userId) {
    const game = activeGames.get(userId);
    if (!game) throw new Error('Nessuna partita attiva per questo utente');

    const card = drawCard(game.deck);
    game.playerHand.push(card);
    const value = calculateHandValue(game.playerHand);
    return { card, playerHand: game.playerHand, value };
}

/**
 * Fa giocare il dealer secondo le regole standard (carta finché < 17)
 * @param {string} userId
 * @returns {{ dealerHand: Array, dealerValue: number }}
 */
export function dealerPlay(userId) {
    const game = activeGames.get(userId);
    if (!game) throw new Error('Nessuna partita attiva per questo utente');

    while (calculateHandValue(game.dealerHand) < 17) {
        game.dealerHand.push(drawCard(game.deck));
    }

    return {
        dealerHand: game.dealerHand,
        dealerValue: calculateHandValue(game.dealerHand),
    };
}

/**
 * Determina il risultato finale della partita.
 * Deve essere chiamato DOPO dealerPlay().
 * @param {string} userId
 * @returns {{ result: 'win' | 'lose' | 'push', playerValue: number, dealerValue: number, payout: number }}
 *   payout è positivo se vince, negativo se perde, 0 se pareggia
 */
export function resolveGame(userId) {
    const game = activeGames.get(userId);
    if (!game) throw new Error('Nessuna partita attiva per questo utente');

    const playerValue = calculateHandValue(game.playerHand);
    const dealerValue = calculateHandValue(game.dealerHand);
    const { bet } = game;

    let result, payout;

    const playerBust = playerValue > 21;
    const dealerBust = dealerValue > 21;

    if (playerBust) {
        result = 'lose';
        payout = -bet;
    } else if (dealerBust) {
        result = 'win';
        payout = bet;
    } else if (playerValue > dealerValue) {
        result = 'win';
        payout = bet;
    } else if (playerValue < dealerValue) {
        result = 'lose';
        payout = -bet;
    } else {
        result = 'push';
        payout = 0;
    }

    return { result, playerValue, dealerValue, payout };
}

/**
 * Elimina la partita dalla memoria (da chiamare sempre dopo resolveGame)
 * @param {string} userId
 */
export function endGame(userId) {
    activeGames.delete(userId);
}

/**
 * Controlla se il giocatore ha fatto blackjack naturale (21 con 2 carte iniziali)
 * @param {string} userId
 * @returns {boolean}
 */
export function isNaturalBlackjack(userId) {
    const game = activeGames.get(userId);
    if (!game) return false;
    return (
        game.playerHand.length === 2 &&
        calculateHandValue(game.playerHand) === 21
    );
}