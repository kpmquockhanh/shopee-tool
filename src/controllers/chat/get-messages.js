import { Message, Room } from '../../models/index.js';
import { errorHelper, genB2Link } from '../../utils/index.js';
import { validateGetMessages } from '../../validators/chat.validator.js';

export default async (req, res) => {
  const { error } = validateGetMessages(req.params);
  if (error) {
    return res.status(400).json(errorHelper('00038', req, error.details[0].message));
  }

  const { room_id: roomId } = req.params;
  const existRoom = await Room.exists({ _id: roomId });
  if (!existRoom) {
    return res.status(404).json(errorHelper('00039', req, 'Room not found'));
  }

  const messages = await Message
    .find({ room: roomId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'user',
      select: 'name photo',
      populate: {
        path: 'photo',
        select: 'src',
      },
    })
    .limit(20);

  return res.status(200).json({
    messages: messages.map((message) => {
      const m = message.toJSON();
      if (m.user.photo) {
        m.user.photo.photoUrl = genB2Link(m.user.photo.src);
      }
      return m;
    }),
  });
};
