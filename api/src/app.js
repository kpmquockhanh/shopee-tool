import express from 'express';
import https from 'https';
import http from 'http';
import * as fs from 'fs';
import { port } from './config/index.js';
import loader from './loaders/index.js';

const app = express();

loader(app);

// eslint-disable-next-line consistent-return
// app.listen(port, (err) => {
//   if (err) {
//     console.log(err);
//     return process.exit(1);
//   }
//   console.log(`Server is running on ${port}`);
// });

http.createServer({}, app).listen(port);
https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}, app).listen(443);

export default app;
