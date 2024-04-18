import { Room, Message } from '../../models/index.js';
import { validateDeleteRoom } from '../../validators/chat.validator.js';
import { errorHelper } from '../../utils/index.js';

export default async (req, res) => {
  const { error } = validateDeleteRoom({ ...req.params });
  if (error) {
    return res.status(400).json(errorHelper('00038', req, error.details[0].message));
  }

  const { user } = req;
  const { room_id: roomId } = req.params;
  const exists = await Room.exists({
    _id: roomId,
    createdBy: user._id,
  });
  if (!exists) {
    return res.status(404).json(errorHelper('00039', req, 'Room not found'));
  }
  // Delete message
  await Message.deleteMany({ room: roomId });
  await Room.deleteOne({ _id: roomId });
  return res.status(200).json({
    message: 'Room deleted successfully',
  });
};
