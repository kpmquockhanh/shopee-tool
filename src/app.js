import express from 'express';
import http from 'http';
import { port } from './config/index.js';
import loader from './loaders/index.js';
import websockets from './loaders/websockets.js';

const app = express();

loader(app);
const server = http.createServer({}, app);
websockets(server, app);

server.listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});
