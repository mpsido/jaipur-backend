import { Card, makeDeck, drawCards } from "./game";

export interface PlayerState {
    cards: Card[];
    nbCamels: number;
}

export enum Player {
    Player1 = "1",
    Player2 = "2",
}

export interface GameState {
    player1State: PlayerState;
    player2State: PlayerState;
    deck: Card[];
    board: Card[];
    nextPlayerPlaying: Player;
}

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
    const gameState = {
        player1State: {
            cards: player1Cards,
            nbCamels: 0,
        } as PlayerState,
        player2State: {
            cards: player2Cards,
            nbCamels: 0,
        } as PlayerState,
        deck,
        board: boardCards,
        nextPlayerPlaying: Player.Player1,
    } as GameState;
    store.set(gameIndex, gameState);
    return { ...gameState, deck: [] as Card[]}; //send the game state (except the deck because the players aren't supposed to know it)
}