import axios from 'axios';
import { telegramBotToken } from '../../config/index.js';
// eslint-disable-next-line import/prefer-default-export
export const sendTelegramMessage = async (chatId, text) => {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'MarkdownV2', // or 'HTML' for HTML formatting
  };

  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const replaceTelegramMarkdown = (text) => text.replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
