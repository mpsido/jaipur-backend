
import { WebSocket } from 'ws';
import { playGameAction } from './game';
import { getGame, startGame, restartGame, store } from './store';


const server = new WebSocket.Server({
    port: 3001
});

export enum MsgType {
    Init = "init",
    Error = "error",
    RestartGame = "restartGame",
    GameState = "gameState",
    GameAction = "gameAction",
}

const initGame = (socket: WebSocket, player: number, gameId: string): void => {
    let sockets = socketMap.get(gameId);
    if (sockets === undefined) {
        sockets = new Map<number, WebSocket>();
    }
    sockets.set(player, socket);
    socketMap.set(gameId, sockets as Map<number, WebSocket>);
    console.log(`Add gameId to socket list ${gameId} for player ${player}`);
}
  
let socketMap = new Map<string, Map<number, WebSocket> >;

const sendGameState = (gameId: string, player: number): void => {
    const gs = getGame(gameId, player);
    if (gs instanceof Error) {
        sendWsMessage(gameId, player, MsgType.Error, { error: gs.message });
        return;
    }
    sendWsMessage(gameId, player, MsgType.GameState, gs);
}

server.on('connection', function(socket: WebSocket) {
    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg: string) {
        const message = JSON.parse(msg);
        const msgType = message.msgType;
        if (!msgType) {
            console.log("not enough information to establish websocket link");
            return;
        }
        const gameId = message.gameId;
        const selectedPlayer = message.selectedPlayer;
        if (!gameId || gameId == "") {
            console.log("not enough information to init game");
            return;
        }
        let player = 0;
        if (selectedPlayer) {
            try {
                player = parseInt(selectedPlayer);
                if (player != 1 && player != 2) {
                    console.log(`Cannot use player ${player}`);
                    return;
                }
            } catch (err) {
                console.log(err);
                return;
            }
        }
        console.log('Received message on websocket ', message, gameId, selectedPlayer);
        try {
          switch (msgType as MsgType) {
              case MsgType.Init:
                  initGame(socket, player, gameId);
                  startGame(gameId);
                  sendGameState(gameId, player);
                  break;
              case MsgType.RestartGame:
                  const restartErr = restartGame(gameId);
                  if (restartErr) {
                      sendWsMessage(gameId, 1, MsgType.Error, { error: restartErr.message });
                      sendWsMessage(gameId, 2, MsgType.Error, { error: restartErr.message });
                  }
                  sendGameState(gameId, 1);
                  sendGameState(gameId, 2);
                  break;
              case MsgType.GameState:
                  sendGameState(gameId, player);
                  break;
              case MsgType.GameAction:
                  let gameState = store.get(gameId);
                  if (!gameState) {
                      sendWsMessage(gameId, player, MsgType.Error, { error: `could not find game ${gameId}` });
                      break;
                  }
                  if (!message.gameAction) {
                      sendWsMessage(gameId, player, MsgType.Error, { error: "Game action is missing" });
                      break;
                  }
                  const resultOrErr = playGameAction(gameId, selectedPlayer, gameState, message.gameAction);
                  if (resultOrErr instanceof Error) {
                      sendWsMessage(gameId, player, MsgType.Error, { error: resultOrErr.message });
                      break;
                  }
                  store.set(gameId, resultOrErr.gameState);
                  sendWsMessage(gameId, player, MsgType.GameAction, { "actionResult": resultOrErr.actionResult });
                  sendGameState(gameId, 1);
                  sendGameState(gameId, 2);
                  break;
          }
        } catch (err) {
          console.error(err);
        }
    });
    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {});
});

export const sendWsMessage = (gameId: string, playerId: number, msgType: MsgType, msg: any) => {
    let sockets = socketMap.get(gameId);
    if (sockets === undefined) {
        console.log(`Don't have socket list for gameId ${gameId}`);
        return;
    }
    console.log("Websocket sending game state to player", playerId, msg);
    (sockets as Map<number, WebSocket>).get(playerId)?.send(JSON.stringify({ ...msg, msgType }));
}
