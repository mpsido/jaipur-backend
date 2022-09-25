
import { WebSocket } from 'ws';


const server = new WebSocket.Server({
    port: 3001
});
  
let socketMap = new Map<string, Map<number, WebSocket> >;
server.on('connection', function(socket: any) {
    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg: string) {
        const message = JSON.parse(msg);
        const gameId = message.gameId;
        const selectedPlayer = message.selectedPlayer;
        if (!selectedPlayer || !gameId || gameId == "") {
            console.log("not enough information to establish websocket link");
            return;
        }
        let player = 0;
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
        console.log('Received message on websocket ', message, gameId, selectedPlayer);
        let sockets = socketMap.get(gameId);
        if (sockets === undefined) {
            sockets = new Map<number, WebSocket>();
        }
        sockets.set(player, socket);
        socketMap.set(gameId, sockets as Map<number, WebSocket>);
        console.log(`Add gameId to socket list ${gameId} for player ${player}`);
    });
    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {});
});

export const sendWsMessage = (gameId: string, playerId: number, msg: any) => {
    let sockets = socketMap.get(gameId);
    if (sockets === undefined) {
        console.log(`Don't have socket list for gameId ${gameId}`);
        return ;
    }
    console.log("Websocket sending game state to player", playerId, msg);
    (sockets as Map<number, WebSocket>).get(playerId)?.send(JSON.stringify(msg));
}