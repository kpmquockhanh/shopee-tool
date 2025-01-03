import { sendTelegramMessage, replaceTelegramMarkdown } from '../../utils/helpers/telegram.js';
import { telegramChatId } from '../../config/index.js';

export default (conn) => (message) => {
  const { time } = message;
  const dbStatus = conn.readyState;

  if (dbStatus !== 1) {
    sendTelegramMessage(
      telegramChatId,
      `[*${replaceTelegramMarkdown(time)}*]:\n DB Status: ${replaceTelegramMarkdown(dbStatus.toString())}`,
    ).then();
  }
};
