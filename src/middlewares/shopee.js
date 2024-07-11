import { errorHelper } from '../utils/index.js';
import constants from '../constants/index.js';

// eslint-disable-next-line consistent-return
export default async (req, res, next) => {
  const token = req.header('access-token');
  if (!token) {
    return res.status(401).json(errorHelper(401, req, constants.unauthorized));
  }
  req.token = token;
  next();
};
