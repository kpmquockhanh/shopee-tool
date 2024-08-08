import { Attachment } from '../../models/index.js';
import { sendTelegramMessage } from '../../utils/helpers/telegram.js';
import { telegramChatId } from '../../config/index.js';
import { genB2Link } from '../../utils/index.js';

export default async (message) => {
  const attachment = await Attachment.findById(message.attachment_id).populate('createdBy');
  if (!attachment) {
    console.log('Attachment not found');
    return;
  }
  sendTelegramMessage(telegramChatId, `
  New image uploaded: ${genB2Link(attachment.src)}\n
  Description: ${attachment.description}\n
  By: ${attachment.createdBy.name}`).then();
};
