import {
    Card,
    makeDeck,
    drawCards,
    makeTokenBoard,
    GameState,
    PlayerState,
    Player,
    TokenType,
} from "./game";

export const store = new Map<string, GameState>();

export const getGame = (gameIndex: string): GameState|Error => {
    if (!store.has(gameIndex)) {
        return new Error("Game does not exists");
    }
    const gameState = { ...store.get(gameIndex) } as GameState;
    gameState.deck = [] as Card[];
    console.log('getGame', gameState);
    // TODO hide the other player's cards
    return gameState; //send the game state (except the deck because the players aren't supposed to know it)
};

export const startGame = (gameIndex: string): GameState|Error => {
    if (store.has(gameIndex)) {
        return new Error("Game already exists");
    }
    let deck: Card[] = makeDeck();
    let player1Cards: Card[] = new Array<Card>();
    let player2Cards: Card[] = new Array<Card>();
    let boardCards: Card[] = new Array<Card>();
    [player1Cards, deck] = drawCards(deck, 5);
    [player2Cards, deck] = drawCards(deck, 5);
    [boardCards, deck] = drawCards(deck, 5);
    const zeroTokens = {
        "diamond-token": [],
        "gold-token": [],
        "silver-token": [],
        "cloth-token": [],
        "spice-token": [],
        "leather-token": [],
        "bonus3-token": [],
        "bonus4-token": [],
        "bonus5-token": [],
        "camel-token": [],
    }
    const gameState = {
        player1State: {
            cards: player1Cards,
            nbCamels: 0,
            tokens: zeroTokens,
        } as PlayerState,
        player2State: {
            cards: player2Cards,
            nbCamels: 0,
            tokens: zeroTokens,
        } as PlayerState,
        deck,
        board: boardCards,
        nextPlayerPlaying: Player.Player1,
        tokenBoard: makeTokenBoard(),
    } as GameState;
    store.set(gameIndex, gameState);
    return getGame(gameIndex);
}