import sizeOf from 'buffer-image-size';
import { Attachment, Room } from '../../models/index.js';
import { validateUpdateRoom } from '../../validators/chat.validator.js';
import {
  errorHelper, genB2Link, getText, logger,
} from '../../utils/index.js';
import { blackblazeBucketId } from '../../config/index.js';

export default async (req, res) => {
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
      const dimensions = sizeOf(req.file.buffer);

      const resp = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken,
        fileName: `${Date.now()}_${req.file.originalname}`,
        data: req.file.buffer,
        contentLength: req.file.size,
      });

      const attachment = new Attachment({
        name: 'Room photo',
        src: resp.data.fileName,
        type: 'room_thumbnail',
        createdBy: req.user._id,
        refId: resp.data.fileId,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
      });
      await attachment.save();

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
