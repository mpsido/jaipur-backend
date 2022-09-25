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
    const gameState = new GameState();
    store.set(gameIndex, gameState);
    return getGame(gameIndex);
}