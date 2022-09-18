import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { startGame, getGame, GameState } from "./store";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/:gameId', (req: Request, res: Response) => {
  console.log(req.params.gameId);
  res.send('Express + TypeScript Server');
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


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
