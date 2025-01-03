import mongoose from 'mongoose';

import { dbUri, debug } from '../config/index.js';

export default async (app) => {
  if (debug) {
    mongoose.set('debug', true);
    console.log('⏳Connecting to MongoDB...', dbUri);
  } else {
    console.log('⏳Connecting to MongoDB...');
  }
  mongoose.set('useFindAndModify', false);
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

  return mongoose.connect(
    dbUri,
  )
    .then((conn) => {
      if (app) {
        app.set('mongooseConnection', conn.connection);
      }
      console.log('✅ Mongodb Connect successfully!');
      return conn.connection;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
};
