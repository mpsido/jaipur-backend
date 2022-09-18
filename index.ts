import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { startGame, getGame, GameState, Player } from "./store";
import { GameAction, action } from "./game";
import cors from 'cors';

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
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
} as cors.CorsOptions;

app.use(cors(corsOptions));

app.get('/:gameId', (req: Request, res: Response) => {
  console.log(req.params.gameId);
  const game = getGame(req.params.gameId);
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
  const game = startGame(req.params.gameId);
  if (game instanceof Error) {
    res.status(404).send((game as Error).message);
    return;
  }

  const gameJson = JSON.stringify(game as GameState);
  res.contentType("application/json");
  res.status(200).send(gameJson);
});

app.post('/:gameId/:playerId', (req: Request, res: Response) => {
  const game = getGame(req.params.gameId);
  if (game instanceof Error) {
    res.status(404).send((game as Error).message);
    return;
  }
  const player = req.params.playerId;
  if (player as Player != game.nextPlayerPlaying) {
    res.status(404).send("Not your turn");
    return;
  }
  console.log(req.body);
  const actionResult = action(req.body);
  console.log(actionResult);
  res.json(actionResult);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
