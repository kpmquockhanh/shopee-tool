import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import get from 'lodash/get.js';
import { MulterError } from 'multer';
import { prefix, jwtSecretKey, AppName } from '../config/index.js';
import routes from '../routes/index.js';
import { logger } from '../utils/index.js';
import { rateLimiter } from '../middlewares/index.js';

export default (app) => {
  process.on('uncaughtException', async (error) => {
    console.log(error);
    await logger('00001', '', error.message, 'Uncaught Exception', '');
  });

  process.on('unhandledRejection', async (ex) => {
    console.log(ex);
    await logger('00002', '', ex.message, 'Unhandled Rejection', '');
  });

  if (!jwtSecretKey) {
    logger('00003', '', 'Jwtprivatekey is not defined', 'Process-Env', '');
    process.exit(1);
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  app.enable('trust proxy');
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(compression());
  app.use(express.static(`${__dirname}/../public`));
  app.disable('x-powered-by');
  app.disable('etag');

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.header('Content-Security-Policy-Report-Only', 'default-src-old: https:');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT POST PATCH DELETE GET');
      return res.status(200).json({});
    }
    next();
    return {};
  });

  app.use(rateLimiter);
  app.use(prefix, routes);

  app.get('/', (_req, res) => res.status(200).json({
    data: {
      en: `${AppName} server is successfully working...`,
    },
    code: '00000',
  }).end());

  app.use((_req, _res, next) => {
    const error = new Error('Endpoint could not find!');
    error.status = 404;
    next(error);
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'MulterError') {
      res.status(400);
    } else {
      res.status(err.status || 500);
    }
    let resultCode = '00015';
    let level = 'External Error';
    if (err.status === 500) {
      resultCode = '00014';
      level = 'Client Error';
    }
    logger(resultCode, get(req, 'user._id') || '', err.message, level, req);
    return res.json({
      data: {
        en: err.message,
      },
      code: resultCode,
    });
  });
};
