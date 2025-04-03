import { Attachment, Message, Room } from '../../models/index.js';
import {
  validateCreateRoom,
  validateDeleteRoom,
  validateGetMessages,
  validateSendMessage, validateUpdateRoom,
} from '../../validators/chat.validator.js';
import {
  errorHelper, genB2Link, getText, logger,
} from '../../utils/index.js';
import { blackblazeBucketId } from '../../config/index.js';
import { uploadFile } from '../../utils/helpers/fileHelper.js';

export const sendMessage = async (req, res) => {
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

export const createRoom = async (req, res) => {
  const { error } = validateCreateRoom({ ...req.body, ...req.params });
  if (error) {
    return res.status(400).json(errorHelper('00038', req, error.details[0].message));
  }

  const { user } = req;
  const userId = user._id;
  const { name, description } = req.body;
  const room = await Room.create({
    name,
    description,
    createdBy: userId,
  });
  return res.status(200).json({
    room,
  });
};

export const deleteRoom = async (req, res) => {
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

export const getMessages = async (req, res) => {
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

export const getRooms = async (req, res) => {
  const rooms = await Room.find().populate('thumbnail').limit(50);
  return res.status(200).json({
    rooms: rooms.map((r) => ({
      ...r.toJSON(),
      thumbnail: r.toJSON().thumbnail ? genB2Link(r.toJSON().thumbnail.src) : '',
    })),
  });
};

export const updateRoom = async (req, res) => {
  const { error } = validateUpdateRoom({ ...req.params, ...req.body });
  if (error) {
    return res.status(400).json(errorHelper('00038', req, error.details[0].message));
  }

  const { user } = req;
  const { room_id: roomId } = req.params;
  let room = await Room.findOne({
    _id: roomId,
    createdBy: user._id,
  }).populate('thumbnail');
  if (!room) {
    return res.status(404).json(errorHelper('00039', req, 'Room not found'));
  }

  if (req.file) {
    try {
      const b2 = req.app.get('b2');
      const { uploadUrl, authorizationToken: uploadAuthToken } = (await b2.getUploadUrl({
        bucketId: blackblazeBucketId,
      })).data;
      // Try to remove the old photo from the bucket
      if (room.thumbnail) {
        const oldPhoto = room.thumbnail;
        await b2.deleteFileVersion({
          fileId: oldPhoto.refId,
          fileName: oldPhoto.src,
        });
        // Delete the old photo from the database
        await Attachment.deleteOne({ _id: oldPhoto._id });
      }

      const ts = Date.now();
      const attachment = await uploadFile(b2, uploadUrl, uploadAuthToken, 'room_thumbnail', req, ts);

      await Room.updateOne({ _id: roomId }, {
        $set: {
          name: req.body.name,
          description: req.body.description,
          thumbnail: attachment._id,
        },
      });
      logger('00086', room._id, getText('en', '00086'), 'Info', req);
    } catch (err) {
      return res.status(500).json(errorHelper('00087', req, err.message)).end();
    }
  } else {
    await Room.updateOne({ _id: roomId }, {
      $set: {
        name: req.body.name,
        description: req.body.description,
      },
    });
  }

  room = await Room.findOne({
    _id: roomId,
    createdBy: user._id,
  }).populate('thumbnail');
  const jRoom = room.toJSON();
  return res.status(200).json({
    room: {
      ...jRoom,
      thumbnail: genB2Link(jRoom.thumbnail.src),
    },
  });
};
