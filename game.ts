import { shuffleArray } from "./util";

enum CardType {
    Diamond = "diamond-card",
    Gold = "gold-card",
    Silver = "silver-card",
    Cloth = "cloth-card",
    Spice = "spice-card",
    Leather = "leather-card",
    Camel = "camel-card",
    Undefined = "",
}

export enum TokenType {
    Diamond = "diamond-token",
    Gold = "gold-token",
    Silver = "silver-token",
    Cloth = "cloth-token",
    Spice = "spice-token",
    Leather = "leather-token",
    Bonus3 = "bonus3-token",
    Bonus4 = "bonus4-token",
    Bonus5 = "bonus5-token",
    Camel = "camel-token",
}

export interface Card {
    cardType: CardType;
    selected: boolean;
}

interface Sale {
    type: CardType,
    qty: number,
}

const deckParameters: Map<CardType, number> = new Map<CardType, number>([
    ["diamond-card" as CardType, 6],
    ["gold-card" as CardType, 6],
    ["silver-card" as CardType, 6],
    ["cloth-card" as CardType, 8],
    ["spice-card" as CardType, 8],
    ["leather-card" as CardType, 10],
    ["camel-card" as CardType, 11],
]);

export const maxCardsInHand: number = 7;
const saleQuotas: Map<CardType, number> = new Map<CardType, number>([
    ["diamond-card" as CardType, 2],
    ["gold-card" as CardType, 2],
    ["silver-card" as CardType, 3],
    ["cloth-card" as CardType, 3],
    ["spice-card" as CardType, 4],
    ["leather-card" as CardType, 4],
]);

export interface PlayerState {
    cards: Card[];
    nbCamels: number;
    tokens: Map<TokenType, number[]>;
}

export enum Player {
    Player1 = "1",
    Player2 = "2",
}

export interface GameState {
    player1State: PlayerState; // TODO store the player state in an array
    player2State: PlayerState;
    deck: Card[]; // TODO the card selections should not be part of the game state
    board: Card[];
    nextPlayerPlaying: Player;
    tokenBoard: Map<TokenType, number[]>;
}

export function makeTokenBoard(): Map<TokenType, number[]> {
    return new Map<TokenType, number[]>([
        [TokenType.Diamond, [5, 5, 5, 7, 7]],
        [TokenType.Gold, [5, 5, 5, 6, 6]],
        [TokenType.Silver, [5, 5, 5, 5, 5]],
        [TokenType.Cloth, [1, 1, 2, 2, 3, 3, 5]],
        [TokenType.Spice, [1, 1, 2, 2, 3, 3, 5]],
        [TokenType.Leather, [1, 1, 1, 1, 1, 1, 2, 3, 4]],
        [TokenType.Bonus3, shuffleArray([4, 4, 3, 3, 2, 1])],
        [TokenType.Bonus4, shuffleArray([6, 5, 4, 4, 3, 3])],
        [TokenType.Bonus5, shuffleArray([8, 7, 6, 5, 4, 4])],
        [TokenType.Camel, [5]],
    ]);
}

export function makeDeck(): Card[] {
    let deck = [] as Card[];
    for (let cardCategory of deckParameters.keys()) {
      let nbCards = deckParameters.get(cardCategory) as number;
      for (let i = 0; i < nbCards; i++) {
        deck = [...deck, { cardType: cardCategory, selected: false }];
      }
    }
    return shuffleArray(deck);
};

export function drawCards(deck: Card[], n: number): [Card[], Card[]] {
    return [deck.slice(0, n), deck.slice(n)];
};

const exchange = (_boardCards: Card[], _handCards: Card[], nbSelectedCamels: number): [Card[], Card[], string, number] => {
    if (_boardCards.length != (_handCards.length + nbSelectedCamels)) {
        return [_boardCards, _handCards, "need to exchange same number of cards", 0];
    }
    return [_handCards, _boardCards, "", nbSelectedCamels];
};

const takeFromDeck = (_boardCards: Card[], _handCards: Card[], nbCardsInHand: number): [Card[], Card[], string, number] => {
    if (_handCards.length > 0) {
        console.log("Hand", _boardCards);
        return [_boardCards, _handCards, "cannot take from deck when hand cards are selected", 0];
    }
    let allCamel = true;
    // check if taking only camels
    for (let card of _boardCards) {
        if (card.cardType != CardType.Camel) {
            allCamel = false;
            break
        }
    }
    // taking camels
    if (allCamel) {
        return [[], _handCards, "", -_boardCards.length];
    }
    // if taking cards
    if (_boardCards.length > 3) {
        return [_boardCards, _handCards, "taking too much cards", 0];

    }
    if (nbCardsInHand + _boardCards.length > maxCardsInHand) {
        return [_boardCards, _handCards, "that would be too much cards in hand", 0];
    }
    // take cards
    return [[], [..._boardCards, ..._handCards], "", 0];
}

const sell = (_boardCards: Card[], _handCards: Card[], nbSelectedCamels: number): [Card[], Card[], string, Sale] => {
    let sale = {
        type: "" as CardType,
        qty: 0,
    } as Sale;
    if (nbSelectedCamels > 0) {
        return [_boardCards, _handCards, "cannot sell camels", sale];
    }
    if (_boardCards.length > 0) {
        return [_boardCards, _handCards, "cannot sell deck cards", sale];
    }
    for (let card of _handCards) {
        if (sale.type != "" && card.cardType != sale.type) {
            return [_boardCards, _handCards, "can only sell one type of merchandise in one turn", sale];
        }
        if (sale.type == CardType.Undefined) {
            sale.type = card.cardType;
            sale.qty = 1;
        }
        sale.qty += 1;
    }
    if (sale.type == CardType.Camel) {
        return [_boardCards, _handCards, "cannot sell camels", sale];
    }
    if (sale.qty < (saleQuotas.get(sale.type) as number)) {
        return [_boardCards, _handCards, "not selling enough", sale];
    }
    return [_boardCards, [], "", sale];
}

export interface GameAction {
    boardCards: Card[];
    handCards: Card[];
    nbSelectedCamels: number;
};

export interface ActionResult {
    board: Card[], 
    hand: Card[],
    errorMsg: string,
    consumedCamels: number,
    selling: Sale, 
};

export const action = (gameAction: GameAction): ActionResult => {
    // TODO verify that the selected cards are in the player's hands and b
    let selectedDeck = gameAction.boardCards.filter(card => card.selected);
    let selectedHand = gameAction.handCards.filter(card => card.selected);
    let remainingBoard = gameAction.boardCards.filter(card => !card.selected);
    let remainingHand = gameAction.handCards.filter(card => !card.selected);
    let putInDeck = [] as Card[];
    let putInHand = [] as Card[];
    let errorMsg = "";
    let consumedCamels = 0;
    let selling = {
        type: "" as CardType,
        qty: 0,
    }
    if (selectedDeck.length > 0 && selectedHand.length > 0) {
        [putInDeck, putInHand, errorMsg, consumedCamels] = exchange(selectedDeck, selectedHand, gameAction.nbSelectedCamels);
        console.log("exchange", putInDeck, putInHand);
    }
    else if (selectedDeck.length > 0) {
        [putInDeck, putInHand, errorMsg, consumedCamels] = takeFromDeck(selectedDeck, selectedHand, gameAction.handCards.length);
        console.log("takeFromDeck", putInDeck, putInHand);
    }
    else if (selectedHand.length > 0) {
        [putInDeck, putInHand, errorMsg, selling] = sell(selectedDeck, selectedHand, gameAction.nbSelectedCamels);
        console.log("sell", putInDeck, putInHand);
    }
    if (errorMsg != "") {
        console.log(errorMsg);
    }
    const actionResult = {
        board: [...remainingBoard, ...putInDeck],
        hand: [...remainingHand, ...putInHand], 
        errorMsg, 
        consumedCamels,
        selling,
    } as ActionResult;
    return actionResult;
};

export const obtainTokens = (sale: Sale, gameState: GameState): GameState|Error => {
    let tokenType: TokenType;
    switch (sale.type) {
        case CardType.Diamond:
            tokenType = TokenType.Diamond;
            break;
        case CardType.Gold:
            tokenType = TokenType.Gold;
            break;
        case CardType.Silver:
            tokenType = TokenType.Silver;
            break;
        case CardType.Spice:
            tokenType = TokenType.Spice;
            break;
        case CardType.Cloth:
            tokenType = TokenType.Cloth;
            break;
        case CardType.Leather:
            tokenType = TokenType.Leather;
            break;
        default:
            return new Error(`Cannot sell card of type ${sale.type}`);
    }
    const minSale = saleQuotas.get(sale.type);
    if (minSale === undefined) {
        return new Error(`Could not find sale quota for type ${sale.type}`);
    }
    let playerTokens: Map<TokenType, number[]>;
    switch (gameState.nextPlayerPlaying) {
        case Player.Player1:
            playerTokens = gameState.player1State.tokens;
            break;
        case Player.Player2:
            playerTokens = gameState.player2State.tokens;
            break;
        default:
            return new Error(`Don't know which player is that: ${gameState.nextPlayerPlaying}`);
    }
    let playerTokensOfThisType: number[];
    playerTokensOfThisType = playerTokens.get(tokenType) as number[];
    let tokens = gameState.tokenBoard.get(tokenType);
    if (tokens === undefined || tokens?.length === 0) {
        return new Error(`No token of type ${sale.type} to distribute`);
    }
    if (sale.qty < minSale) {
        return new Error(`Need to sell at least ${minSale}`);
    }
    for (let i = 0; i < sale.qty; i++) {
        if (tokens.length === 0) {
            console.log("No more tokens to distribute");
            break;
        }
        let obtainedToken = tokens!.pop() as number;
        playerTokensOfThisType.push(obtainedToken);
    }
    playerTokens.set(tokenType, playerTokensOfThisType);
    switch (gameState.nextPlayerPlaying) {
        case Player.Player1:
            gameState.player1State.tokens = playerTokens;
            break;
        case Player.Player2:
            gameState.player2State.tokens = playerTokens;
            break;
        default:
            return new Error(`Don't know which player is that: ${gameState.nextPlayerPlaying}`);
    }
    gameState.tokenBoard.set(tokenType, tokens as number[]);
    console.log("Updated tokenBoard", gameState.tokenBoard);
    return gameState;
};