import B2 from 'backblaze-b2';
import { blackblazeApplicationKey, blackblazeKeyId } from '../config/index.js';

export default async (app) => {
  const b2 = new B2({
    applicationKeyId: blackblazeKeyId,
    applicationKey: blackblazeApplicationKey,
    axios: {
      timeout: 30000,
    },
    retry: {
      retries: 3, // this is the default
    },
  });

  try {
    const result = await b2.authorize({});
    if (result.status === 200) {
      console.log('✅ Connected to blacblaze success!');
      app.set('b2', b2);
    } else {
      console.log('Authorization failed:', result);
    }
  } catch (err) {
    console.log('Could not connect to blackblaze:', err);
  }
};
