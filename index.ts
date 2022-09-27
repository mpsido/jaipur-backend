import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { store, startGame, getGame, restartGame } from "./store";
import {
  action,
  drawCards,
  GameState,
  Player,
  obtainTokens,
  verifyGameAction,
  awardCamelToken,
  PlayerState,
} from "./game";
import cors from 'cors';
import { sendWsMessage } from "./websocket";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(bodyParser.json());
var allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://localhost:3000'];
let corsOptions = {
  origin: function(origin: string, callback: Function){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.' + `Origin is ${origin}`;
      console.log(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
} as cors.CorsOptions;

app.use(cors(corsOptions));

app.get('/game/:gameId/:playerId', (req: Request, res: Response) => {
  console.log(req.params.gameId);
  const game = getGame(req.params.gameId, parseInt(req.params.playerId));
  if (game instanceof Error) {
    res.status(404).send((game as Error).message);
    return;
  }
  const gameJson = JSON.stringify(game as GameState);
  res.contentType("application/json");
  res.status(200).send(gameJson);
});


app.get('/start/:gameId', (req: Request, res: Response) => {
  console.log("Start game with id: ", req.params.gameId);
  const err = startGame(req.params.gameId);
  if (err instanceof Error) {
    res.status(404).send((err as Error).message);
    return;
  }
  res.status(200).send("Game created");
});

app.get('/restart/:gameId', (req: Request, res: Response) => {
  console.log("Start game with id: ", req.params.gameId);
  const err = restartGame(req.params.gameId);
  if (err instanceof Error) {
    res.status(404).send((err as Error).message);
    return;
  }
  res.status(200).send("Game created");
});

app.post('/:gameId/:playerId', (req: Request, res: Response) => {
  const gameId = req.params.gameId;
  let gameState = store.get(gameId);
  if (!gameState) {
    res.status(404).send(`could not find game ${gameId}`);
    return;
  }
  if (gameState.gameOver) {
    res.status(404).send("Game is already over");
    return;
  } 
  const player = req.params.playerId;
  if (player as Player != gameState.nextPlayerPlaying) {
    res.status(404).send("Not your turn");
    return;
  }
  let checkAction = verifyGameAction(gameState, req.body);
  if (checkAction !== null) {
    res.status(404).send((checkAction as Error).message);
    return;
  }

  const actionResult = action(req.body);
  console.log(actionResult);

  if (actionResult.errorMsg != "") {
    res.status(404).send(actionResult.errorMsg);
    return;
  }

  // TODO wrap all this in a game function
  gameState.board = actionResult.board;
  switch (gameState.nextPlayerPlaying) {
    case Player.Player1:
      gameState.currentPlayer().cards = actionResult.hand;
      break;
    case Player.Player2:
      gameState.currentPlayer().cards = actionResult.hand;
      break;
  }
  if (actionResult.selling.qty > 0) {
    let gsOrError = obtainTokens(actionResult.selling, gameState);
    if (gsOrError instanceof Error) {
      res.status(404).send((gsOrError as Error).message);
      return;
    }
    gameState = gsOrError as GameState;
  }
  if (gameState.board.length < 5) {
    let [extraCards, deck] = drawCards(gameState.deck, 5 - gameState.board.length);
    console.log("Add to deck", extraCards, gameState.board);
    gameState.deck = deck;
    gameState.board = [...gameState.board, ...extraCards];
  }
  switch (gameState.nextPlayerPlaying) {
    case Player.Player1:
      gameState.currentPlayer().nbCamels -= actionResult.consumedCamels;
      break;
    case Player.Player2:
      gameState.currentPlayer().nbCamels -= actionResult.consumedCamels;
      break;
  }
  gameState.nextPlayerPlaying = gameState.nextPlayerPlaying == Player.Player1 ? Player.Player2 : Player.Player1;
  const gameOver = gameState.isGameOver();
  if (gameOver) {
    gameState = awardCamelToken(gameState);
    gameState.playersState.map((playerState: PlayerState) => {
      playerState.computeScore();
    });
  }
  store.set(gameId, gameState);
  sendWsMessage(gameId, 1, getGame(gameId, 1));
  sendWsMessage(gameId, 2, getGame(gameId, 2));
  res.json(actionResult);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is listening on port ${port}`);
});
