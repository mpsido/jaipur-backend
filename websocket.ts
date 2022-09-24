
import { WebSocket } from 'ws';


const server = new WebSocket.Server({
    port: 3001
});
  
let socketMap = new Map<string, WebSocket[]>;
server.on('connection', function(socket: any) {
    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg: string) {
        const message = JSON.parse(msg);
        const gameId = message.gameId;
        console.log('Received message on websocket ', message, gameId);
        if (gameId && gameId !== "") {
            let sockets = socketMap.get(gameId);
            if (sockets === undefined) {
                sockets = [] as WebSocket[];
            }
            sockets?.push(socket);
            socketMap.set(gameId, sockets as WebSocket[]);
            console.log(`Add gameId to socket list ${gameId}`, sockets?.length);
        }
    });
    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {});
});

export const sendWsMessage = (gameId: string, msg: any) => {
    let sockets = socketMap.get(gameId);
    if (sockets === undefined) {
        console.log(`Don't have socket list for gameId ${gameId}`);
        return ;
    }
    console.log("Websocket sending game state", msg);
    (sockets as WebSocket[]).forEach(s => s.send(JSON.stringify(msg)));
}