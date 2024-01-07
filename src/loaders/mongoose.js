import mongoose from 'mongoose';

import { dbUri, debug } from '../config/index.js';

export default async () => {
  console.log('Connecting to MongoDB...', dbUri);
  if (debug) {
    mongoose.set('debug', true);
  }
  mongoose.set('useFindAndModify', false);
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

  await mongoose.connect(
    dbUri,
  )
    .then(() => {
      console.log('Mongodb Connect successfully!');
    })
    .catch((err) => {
      console.log(err);
    });
};
