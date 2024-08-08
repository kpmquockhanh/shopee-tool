import { config } from 'dotenv';

export { default as swaggerConfig } from './swagger.config.js';

config();
const {
  DB_URI,
  PORT,
  JWT_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  BUCKET_NAME,
  SHOPEE_API,
  DEBUG,
  ENCRYPT_KEY,
  IV,
  APP_NAME,
  BLACKBLAZE_KEY_ID,
  BLACKBLAZE_APPLICATION_KEY,
  BLACKBLAZE_BUCKET_ID,
  BLACKBLAZE_BUCKET_URL,
  SUB_FOLDER,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} = process.env;

export const AppName = APP_NAME;
export const port = PORT || 3000;
export const jwtSecretKey = JWT_SECRET_KEY;
export const refreshTokenSecretKey = REFRESH_TOKEN_SECRET_KEY;
export const dbUri = DB_URI;
export const awsAccessKey = AWS_ACCESS_KEY_ID;
export const awsSecretAccessKey = AWS_SECRET_ACCESS_KEY;
export const awsRegion = AWS_REGION;
export const bucketName = BUCKET_NAME;
export const prefix = '/api';
export const specs = '/docs';
export const shopeeApi = SHOPEE_API;
export const debug = DEBUG === 'true';
export const encryptKey = ENCRYPT_KEY;
export const iv = IV;
export const blackblazeKeyId = BLACKBLAZE_KEY_ID;
export const blackblazeApplicationKey = BLACKBLAZE_APPLICATION_KEY;
export const blackblazeBucketId = BLACKBLAZE_BUCKET_ID;
export const blackblazeBucketUrl = BLACKBLAZE_BUCKET_URL;
export const subFolder = SUB_FOLDER;
export const rabbitmqHost = process.env.RABBITMQ_HOST || '127.0.0.1';
export const rabbitmqUser = process.env.RABBITMQ_USER || 'guest';
export const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'guest';
export const telegramBotToken = TELEGRAM_BOT_TOKEN;
export const telegramChatId = TELEGRAM_CHAT_ID;
