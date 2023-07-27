import * as crypto from 'crypto';
import { encryptKey, iv } from '../../config/index.js';

export const genCartToken = () => crypto.randomBytes(10).toString('hex');

export const encryptString = (text) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(iv, 'hex'));
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
};

export const decrypt = (text) => {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
