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
    const gameState = store.get(gameIndex) as GameState;
    return { ...gameState, deck: [] as Card[]}; //send the game state (except the deck because the players aren't supposed to know it)
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
    const zeroTokens = new Map<TokenType, number[]>([
        [TokenType.Diamond, []],
        [TokenType.Gold, []],
        [TokenType.Silver, []],
        [TokenType.Cloth, []],
        [TokenType.Spice, []],
        [TokenType.Leather, []],
        [TokenType.Bonus3, []],
        [TokenType.Bonus4, []],
        [TokenType.Bonus5, []],
    ]);
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
    return { ...gameState, deck: [] as Card[]}; //send the game state (except the deck because the players aren't supposed to know it)
}