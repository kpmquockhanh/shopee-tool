import B2 from 'backblaze-b2';
import { blackblazeApplicationKey, blackblazeBucketId, blackblazeKeyId } from '../config/index.js';

export default async (app) => {
  const b2 = new B2({
    applicationKeyId: blackblazeKeyId,
    applicationKey: blackblazeApplicationKey,
    axios: {
      timeout: 30000,
      onUploadProgress(progressEvent) {
        console.log('KPM QUOCKHANH loading', {
          loaded: progressEvent.loaded,
          total: progressEvent.total,
        });
      },
    },
    retry: {
      retries: 3, // this is the default
    },
  });

  try {
    const result = await b2.authorize({});
    if (result.status === 200) {
      console.log('Connected to blacblaze success!');
      // const { uploadUrl, authorizationToken } = (
      //   await b2.getUploadUrl({ bucketId: blackblazeBucketId })
      // ).data;
      app.set('b2', b2);
      // app.set('authorizationToken', authorizationToken);
    } else {
      console.log('Authorization failed:', result);
    }
  } catch (err) {
    console.log('Could not connect to blackblaze:', err);
  }
};
