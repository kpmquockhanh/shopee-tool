import pkg from 'jsonwebtoken';
import { jwtSecretKey, refreshTokenSecretKey } from '../../config/index.js';

const { sign } = pkg;

const buildPayload = (user) => (user.toJSON());

export function signAccessToken(user) {
  return sign(
    buildPayload(user),
    jwtSecretKey,
    {
      expiresIn: '7d',
    },
  );
}
export function signRefreshToken(user) {
  return sign(
    buildPayload(user),
    refreshTokenSecretKey,
    {
      expiresIn: '7d',
    },
  );
}
export function signConfirmCodeToken(userId, confirmCode) {
  return sign(
    { _id: userId, code: confirmCode },
    jwtSecretKey,
    {
      expiresIn: '5m',
    },
  );
}
