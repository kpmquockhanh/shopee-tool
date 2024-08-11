import { replaceTelegramMarkdown, sendTelegramMessage } from '../../utils/helpers/telegram.js';
import { telegramChatId } from '../../config/index.js';

export default async (message) => {
  const { level, stack } = message;
  sendTelegramMessage(
    telegramChatId,
    `[*${level}*]: \`\`\`${replaceTelegramMarkdown(stack)}\`\`\``,
  ).then();
};
