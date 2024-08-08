import mongooseLoader from './mongoose.js';
import expressLoader from './express.js';
import backblaze from './backblaze.js';
import initConnection from './rabbitmq.js';

export default async (app) => {
  await mongooseLoader();
  expressLoader(app);
  backblaze(app);
  initConnection();
};
