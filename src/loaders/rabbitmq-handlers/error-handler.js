import { replaceTelegramMarkdown, sendTelegramMessage } from '../../utils/helpers/telegram.js';
import { telegramChatId } from '../../config/index.js';

export default async (message) => {
  const { level, stack } = message;
  sendTelegramMessage(
    telegramChatId,
    `[*${level}*]: \`\`\`${replaceTelegramMarkdown(stack)}\`\`\``,
  ).then(() => {
    console.log('Error message sent successfully.');
  }).catch((error) => {
    console.error('Error sending Telegram message:', error);
  });
};
