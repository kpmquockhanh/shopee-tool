import { Room, Message, Attachment } from '../../models/index.js';
import { validateDeleteRoom } from '../../validators/chat.validator.js';
import { errorHelper } from '../../utils/index.js';
import { blackblazeBucketId } from '../../config/index.js';

export default async (req, res) => {
  const { error } = validateDeleteRoom({ ...req.params });
  if (error) {
    return res.status(400).json(errorHelper('00038', req, error.details[0].message));
  }

  const { user } = req;
  const { room_id: roomId } = req.params;
  const room = await Room.findOne({
    _id: roomId,
    createdBy: user._id,
  }).populate('thumbnail');
  if (!room) {
    return res.status(404).json(errorHelper('00039', req, 'Room not found'));
  }
  // Delete message
  await Message.deleteMany({ room: roomId });
  await Room.deleteOne({ _id: roomId });

  try {
    // Try to remove the old photo from the bucket
    if (room.thumbnail) {
      const b2 = req.app.get('b2');
      const oldPhoto = room.thumbnail;
      await b2.deleteFileVersion({
        fileId: oldPhoto.refId,
        fileName: oldPhoto.src,
      });
      // Delete the old photo from the database
      await Attachment.deleteOne({ _id: oldPhoto._id });
    }
  } catch (e) {
    console.log('Error deleting room thumbnail', e);
  }
  return res.status(200).json({
    message: 'Room deleted successfully',
  });
};
