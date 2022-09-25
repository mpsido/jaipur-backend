import { shuffleArray } from "./util";

export enum CardType {
    Diamond = "diamond-card",
    Gold = "gold-card",
    Silver = "silver-card",
    Cloth = "cloth-card",
    Spice = "spice-card",
    Leather = "leather-card",
    Camel = "camel-card",
    Jaipur = "jaipur-card",
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
    ["silver-card" as CardType, 2],
    ["cloth-card" as CardType, 1],
    ["spice-card" as CardType, 1],
    ["leather-card" as CardType, 1],
]);

export class PlayerState {
    cards: Card[];
    nbCamels: number;
    tokens: TokenInventory;
    score: number;

    constructor(cards: Card[]) {
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
        this.cards = cards;
        this.nbCamels = 0;
        this.tokens = zeroTokens;
        this.score = 0;
    }

    computeScore(): number {
        let score = 0;
        for (let tokenType of Object.keys(this.tokens)) {
            score += this.tokens[tokenType as unknown as TokenType].reduce((partialSum, a) => partialSum + a, 0);
        }
        this.score = score;
        return this.score;
    }
}

export enum Player {
    Player1 = "1",
    Player2 = "2",
}

export interface TokenInventory {
    "diamond-token": number[];
    "gold-token": number[];
    "silver-token": number[];
    "cloth-token": number[];
    "spice-token": number[];
    "leather-token": number[];
    "bonus3-token": number[];
    "bonus4-token": number[];
    "bonus5-token": number[];
    "camel-token": number[];
};

export class GameState {
    playersState: PlayerState[];
    deck: Card[];
    board: Card[];
    nextPlayerPlaying: Player;
    tokenBoard: TokenInventory;
    gameOver: boolean;

    constructor() {
        let deck: Card[] = makeDeck();
        let player1Cards: Card[] = new Array<Card>();
        let player2Cards: Card[] = new Array<Card>();
        let boardCards: Card[] = new Array<Card>();
        [player1Cards, deck] = drawCards(deck, 5);
        [player2Cards, deck] = drawCards(deck, 5);
        [boardCards, deck] = drawCards(deck, 5);
        this.gameOver = false;
        this.playersState = [
            new PlayerState(player1Cards),
            new PlayerState(player2Cards),
        ],
        this.deck = deck;
        this.board = boardCards;
        this.nextPlayerPlaying=  Player.Player1;
        this.tokenBoard = makeTokenBoard();
    }

    currentPlayer() {
        return this.playersState[this.nextPlayerPlaying as unknown as number - 1];
    }

    setCurrentPlayerState(playerState: PlayerState) {
        this.playersState[this.nextPlayerPlaying as unknown as number - 1] = playerState;
    }

    setCurrentPlayerTokens(tokenInv: TokenInventory) {
        this.playersState[this.nextPlayerPlaying as unknown as number - 1].tokens = tokenInv;
    }

    isGameOver(): boolean {
        if (this.gameOver === true) {
            return true;
        }
        if (this.deck.length === 0) {
            this.gameOver = true;
            return this.gameOver;
        }
        let nbSoldOut = 0;
        const tokenTypesToCheck = [
            TokenType.Diamond,
            TokenType.Gold,
            TokenType.Silver,
            TokenType.Spice,
            TokenType.Cloth,
            TokenType.Leather,
        ]
        for (let merchandise of tokenTypesToCheck) {
            if ((this.tokenBoard[merchandise] as number[]).length === 0) {
                nbSoldOut += 1;
            }
        }
        if (nbSoldOut >= 3) {
            this.gameOver = true;
            return this.gameOver;
        }

        return false;
    }
}

export function makeTokenBoard(): TokenInventory {
    return {
        "diamond-token": [5, 5, 5, 7, 7],
        "gold-token": [5, 5, 5, 6, 6],
        "silver-token": [5, 5, 5, 5, 5],
        "cloth-token": [1, 1, 2, 2, 3, 3, 5],
        "spice-token": [1, 1, 2, 2, 3, 3, 5],
        "leather-token": [1, 1, 1, 1, 1, 1, 2, 3, 4],
        "bonus3-token": shuffleArray([4, 4, 3, 3, 2, 1]),
        "bonus4-token": shuffleArray([6, 5, 4, 4, 3, 3]),
        "bonus5-token": shuffleArray([8, 7, 6, 5, 4, 4]),
        "camel-token": [5],
    };
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
    if (nbSelectedCamels == 0) {
        return [_handCards, _boardCards, "", nbSelectedCamels];
    }
    let camelsInBoard: Card[] = Array(nbSelectedCamels).fill({
        cardType: CardType.Camel,
        selected: false,
    } as Card);
    return [[..._handCards, ...camelsInBoard], _boardCards, "", nbSelectedCamels];
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
        // TODO if taking camels: need to take all the camels in the board
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
            continue;
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

export const verifyGameAction = (gameState: GameState, gameAction: GameAction): Error|null => {
    let hand: Card[];
    let nbCamels: number;
    switch (gameState.nextPlayerPlaying) {
        case Player.Player1:
            hand = gameState.currentPlayer().cards;
            nbCamels = gameState.currentPlayer().nbCamels;
            break;
        case Player.Player2:
            hand = gameState.currentPlayer().cards;
            nbCamels = gameState.currentPlayer().nbCamels;
            break;
    }
    if (gameAction.nbSelectedCamels > nbCamels) {
        return new Error(`Cannot select ${gameAction.nbSelectedCamels} camels only have ${nbCamels}`);
    }
    var BreakException = {};
    let handVerficiation: Error|null = null;
    gameAction.handCards.forEach((card: Card, i: number) => {
        if (card.cardType !== hand[i].cardType) {
            handVerficiation = new Error("This is not your hand");
            throw BreakException;
        }
    });
    if (handVerficiation !== null) {
        return handVerficiation;
    }
    let boardVerification: Error|null = null;
    gameAction.boardCards.forEach((card: Card, i: number) => {
        if (card.cardType !== gameState.board[i].cardType) {
            boardVerification = new Error("This is not your hand");
            throw BreakException;
        }
    });
    if (boardVerification !== null) {
        return boardVerification;
    }
    return null;
}

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
    if (selectedDeck.length > 0 && (selectedHand.length > 0 || gameAction.nbSelectedCamels > 0)) {
        [putInDeck, putInHand, errorMsg, consumedCamels] = exchange(selectedDeck, selectedHand, gameAction.nbSelectedCamels);
        console.log("exchange", putInDeck, putInHand);
    }
    else if (selectedDeck.length > 0 && gameAction.nbSelectedCamels == 0) {
        [putInDeck, putInHand, errorMsg, consumedCamels] = takeFromDeck(selectedDeck, selectedHand, gameAction.handCards.length);
        console.log("takeFromDeck", putInDeck, putInHand);
    }
    else if (selectedHand.length > 0) {
        [putInDeck, putInHand, errorMsg, selling] = sell(selectedDeck, selectedHand, gameAction.nbSelectedCamels);
        console.log("sell", putInDeck, putInHand);
    }
    const newHand = [...remainingHand, ...putInHand];
    if (newHand.length > maxCardsInHand) {
        errorMsg = `Cannot have more than ${maxCardsInHand} cards in hand`;
    }
    if (errorMsg != "") {
        console.log(errorMsg);
    }
    const actionResult = {
        board: [...remainingBoard, ...putInDeck],
        hand: newHand, 
        errorMsg, 
        consumedCamels,
        selling,
    } as ActionResult;
    return actionResult;
};

export const awardCamelToken = (gameState: GameState): GameState => {
    if (gameState.gameOver === false) {
        return gameState;
    }
    const camelToken = gameState.tokenBoard[TokenType.Camel].pop();
    if (camelToken === undefined) {
        console.log("No camel token !");
        return gameState;
    }
    let camelWinner = -1;
    if (gameState.playersState[0].nbCamels > gameState.playersState[1].nbCamels) {
        camelWinner = 0;
    } else if (gameState.playersState[1].nbCamels > gameState.playersState[0].nbCamels) {
        camelWinner = 1;
    }
    if (camelWinner !== -1) {
        gameState.playersState[camelWinner].tokens[TokenType.Camel].push(camelToken as number);
    }
    return gameState;   
}

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
    let playerTokens = gameState.currentPlayer().tokens;
    let playerTokensOfThisType: number[];
    playerTokensOfThisType = playerTokens[tokenType] as number[];
    let tokens = gameState.tokenBoard[tokenType];
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
    playerTokens[tokenType] = playerTokensOfThisType;
    const distributeBonusToken = (bonusType: TokenType) => {
        let tokenValue = gameState.tokenBoard[bonusType].pop();
        if (tokenValue === undefined) {
            console.log(`No more ${bonusType}`);
        } else {
            playerTokens[bonusType].push(tokenValue as number);
        }
    }
    if (sale.qty == 3) {
        // add a bonus token 3
        distributeBonusToken(TokenType.Bonus3);
    } else if (sale.qty == 4) {
        // add a bonus token 4
        distributeBonusToken(TokenType.Bonus4);
    } else if (sale.qty >= 5) {
        // add a bonus token 5
        distributeBonusToken(TokenType.Bonus5);
    }
    gameState.setCurrentPlayerTokens(playerTokens);
    gameState.tokenBoard[tokenType] = tokens as number[];
    console.log("Updated tokenBoard", gameState.tokenBoard);
    return gameState;
};