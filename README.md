# Jaipur backend

## Acknowledgements

Bootstraped the repo using this tutorial: https://blog.logrocket.com/how-to-set-up-node-typescript-express/

## Steps

```sh
mkdir jaipur-backend
cd jaipur-backend
npm init
npm install express dotenv
npm i -D typescript @types/express @types/node
npx tsc --init
# "outDir": "./dist" in tsconfig.json
# npm scripts in package.json
# "build": "npx tsc",
# "start": "node dist/index.js",
# "dev": "concurrently \"npx tsc --watch\" \"nodemon -q dist/index.js\""
```

## Some information to help you read the code

This is the backend of the jaipur card game located in this repository: https://github.com/mpsido/jaipur. Please have a look at the [README.md](https://github.com/mpsido/jaipur#readme) of the frontend repo to understand what the card game is about.

The backend serves a REST API on port 3000. The API functions are defined in `index.ts`.

The backend listens to websocket on port 3001. The websockets messages are defined in `websocket.ts`.

In order to represent the state of every game room the backend implements an "in memory" storage whose code is in `store.ts`.

The game logic is coded in `game.ts`. You can see the definition of the `GameState` structure that is exchanged between the frontend and the backend in the websocket messages.
