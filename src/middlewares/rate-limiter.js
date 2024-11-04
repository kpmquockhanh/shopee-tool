import { RateLimiterMongo } from 'rate-limiter-flexible';
import { errorHelper } from '../utils/index.js';

export default (req, res, next) => {
  const mongooseConnection = req.app.get('mongooseConnection');
  const opts = {
    storeClient: mongooseConnection,
    tableName: 'rateLimits',
    points: 100, // x requests
    duration: 60, // per y second by IP
  };

  const rateLimiterMongo = new RateLimiterMongo(opts);
  rateLimiterMongo.consume(req.ip)
    .then(() => {
      next();
    })
    .catch((err) => res.status(429).json(errorHelper('00024', req, err.message)));

  // const rabbitmqConnection = req.app.get('mqConnection');
  // rabbitmqConnection.sendToQueue('new-req', { ip: req.ip }).then(() => {
  //
  // });
};
