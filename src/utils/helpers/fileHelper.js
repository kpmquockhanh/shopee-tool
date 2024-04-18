import { blackblazeBucketUrl } from '../../config/index.js';

// eslint-disable-next-line import/prefer-default-export
export const genB2Link = (url) => {
  if (!url) return null;
  return `${blackblazeBucketUrl}${url}`;
};
