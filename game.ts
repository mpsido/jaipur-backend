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

enum TokenType {
    Diamond = "diamond-token",
    Gold = "gold-token",
    Silver = "silver-token",
    Cloth = "cloth-token",
    Spice = "spice-token",
    Leather = "leather-token",
    Bonus3 = "bonus3-token",
    Bonus4 = "bonus4-token",
    Bonus5 = "bonus5-token",
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

export const tokenValues: Map<TokenType, number[]> = new Map<TokenType, number[]>([
    [TokenType.Diamond, [7, 7, 5, 5, 5]],
    [TokenType.Gold, [6, 6, 5, 5, 5]],
    [TokenType.Silver, [5, 5, 5, 5, 5]],
    [TokenType.Cloth, [5, 3, 3, 2, 2, 1, 1]],
    [TokenType.Spice, [5, 3, 3, 2, 2, 1, 1]],
    [TokenType.Leather, [4, 3, 2, 1, 1, 1, 1, 1, 1]],
    [TokenType.Bonus3, shuffleArray([4, 4, 3, 3, 2, 1])],
    [TokenType.Bonus4, shuffleArray([6, 5, 4, 4, 3, 3])],
    [TokenType.Bonus5, shuffleArray([8, 7, 6, 5, 4, 4])],
]);

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
        alert(errorMsg);
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