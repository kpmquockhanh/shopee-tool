import pkg from 'jsonwebtoken';
import { jwtSecretKey, refreshTokenSecretKey } from '../../config/index.js';

const { sign } = pkg;

export function signAccessToken(userId) {
  return sign(
    { _id: userId },
    jwtSecretKey,
    {
      expiresIn: '1h',
    },
  );
}
export function signRefreshToken(userId) {
  return sign(
    { _id: userId },
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
