import {
    Card,
    GameState,
    CardType,
    PlayerState,
} from "./game";

export const store = new Map<string, GameState>();

export const getGame = (gameIndex: string, player: number): GameState|Error => {
    if (!store.has(gameIndex)) {
        return new Error("Game does not exists");
    }
    const gameState = { ...store.get(gameIndex) } as GameState;
    // hide the other player's cards
    let cards = gameState.playersState[player % 2].cards.map((card: Card) => {
        return {
            ...card,
            cardType: CardType.Jaipur,
        };
    });
    let playersState: PlayerState[];
    if (player == 1) {
        playersState = [
            gameState.playersState[0],
            {
                ...gameState.playersState[1],
                cards,
            } as PlayerState
        ];
    } else {
        playersState = [
            {
                ...gameState.playersState[0],
                cards,
            } as PlayerState,
            gameState.playersState[1],
        ];
    }
    return {
        ...gameState,
        deck: [] as Card[],
        playersState,
        tokenBoard: {
            ...gameState.tokenBoard,
            "bonus3-token": [gameState.tokenBoard["bonus3-token"].length],
            "bonus4-token": [gameState.tokenBoard["bonus4-token"].length],
            "bonus5-token": [gameState.tokenBoard["bonus5-token"].length],
        }
    } as GameState; //send the game state (except the deck because the players aren't supposed to know it)
};

export const startGame = (gameIndex: string): void|Error => {
    if (store.has(gameIndex)) {
        return new Error("Game already exists");
    }
    const gameState = new GameState();
    store.set(gameIndex, gameState);
    return;
}
