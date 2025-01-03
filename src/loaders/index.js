import mongooseLoader from './mongoose.js';
import expressLoader from './express.js';
import backblaze from './backblaze.js';
import { rabbitmqLoader } from './rabbitmq.js';
import scheduleLoader from './schedule.js';

export default async (app) => {
  await rabbitmqLoader(app);
  await mongooseLoader(app);
  expressLoader(app);
  backblaze(app);
  scheduleLoader(app);
};
