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