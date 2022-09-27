import express, { Express } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(bodyParser.json());
var allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://localhost:3000', 'http://benthaier.freeboxos.fr:35173'];
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