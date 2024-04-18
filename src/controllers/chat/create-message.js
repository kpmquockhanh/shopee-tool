import { Message, Room } from '../../models/index.js';
import { validateSendMessage } from '../../validators/chat.validator.js';
import { errorHelper, genB2Link } from '../../utils/index.js';

export default async (req, res) => {
  const { error } = validateSendMessage({ ...req.body, ...req.params });
  if (error) {
    return res.status(400).json(errorHelper('00038', req, error.details[0].message));
  }

  const { user } = req;
  const { content } = req.body;
  const { room_id: roomId } = req.params;

  // Check room exists
  const existRoom = await Room.exists({ _id: roomId });
  if (!existRoom) {
    return res.status(404).json(errorHelper('00039', req, 'Room not found'));
  }

  const userId = user._id;
  const msg = await Message.create({
    content,
    user: userId,
    room: roomId,
  });

  const message = (await Message.findById(msg._id).populate({
    path: 'user',
    select: 'name photo',
    populate: {
      path: 'photo',
      select: 'src',
    },
  })).toJSON();

  if (message.user.photo) {
    message.user.photo.photoUrl = genB2Link(message.user.photo.src);
  }

  if (req.io) {
    req.io.of('/chat').to(roomId).emit('new_message', message);
  }
  return res.status(200).json({
    message: 'Message created',
  });
};
