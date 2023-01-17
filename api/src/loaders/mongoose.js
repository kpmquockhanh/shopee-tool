import mongoose from 'mongoose';

import { dbUri } from '../config/index.js';

export default async () => {
    console.log('Connecting to MongoDB...', dbUri);
  await mongoose.connect(
    dbUri,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
    .then(() => {
      console.log('Mongodb Connect successfully!');
    })
    .catch((err) => {
      console.log(err);
    });
};
