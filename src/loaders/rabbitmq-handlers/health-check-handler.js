import { sendTelegramMessage, replaceTelegramMarkdown } from '../../utils/helpers/telegram.js';
import { telegramChatId } from '../../config/index.js';

export default (conn) => (message) => {
  const { time } = message;
  const dbStatus = conn.readyState;
  console.log('Health check initiated at', time, 'with DB Status:', dbStatus);
  if (dbStatus !== 1) {
    sendTelegramMessage(
      telegramChatId,
      `[*${replaceTelegramMarkdown(time)}*]:\n DB Status: ${replaceTelegramMarkdown(dbStatus.toString())}`,
    ).then(() => {
      console.log('Telegram message sent successfully.');
    }).catch((error) => {
      console.error('Error sending Telegram message:', error);
    });
  }
};
