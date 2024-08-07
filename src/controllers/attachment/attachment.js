import { Attachment, Relationship } from '../../models/index.js';
import {
  validateCreateAttachment,
  validateDeleteAttachment,
  validateGetAttachment,
} from '../../validators/attachment.validator.js';
import { blackblazeBucketId } from '../../config/index.js';
import { genB2Link } from '../../utils/index.js';
import { uploadFile } from '../../utils/helpers/fileHelper.js';

export const getAttachments = async (req, res) => {
  const rs = validateGetAttachment(req.query);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const cond = {
    type: {
      $in: ['preview'],
    },
  };

  const { user } = req;
  const listAvailableUserIds = [user._id];

  const relationships = await Relationship.find({
    $or: [{ origin: user._id }, { target: user._id }],
    type: 'friend',
    status: 'accepted',
  });
  relationships.forEach((r) => {
    if (r.origin._id.toString() !== user._id.toString()) {
      listAvailableUserIds.push(r.origin._id);
    }
    if (r.target._id.toString() !== user._id.toString()) {
      listAvailableUserIds.push(r.target._id);
    }
  });
  cond.createdBy = {
    $in: listAvailableUserIds,
  };

  const attachments = await Attachment
    .find(cond)
    .select({
      name: 1,
      src: 1,
      createdBy: 1,
      width: 1,
      height: 1,
      description: 1,
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'createdBy',
      select: 'name photo',
      populate: {
        path: 'photo',
        select: 'src',
      },
    })
    .limit(limit)
    .skip((page - 1) * limit);
  // Count total
  const total = await Attachment.count(cond);
  return res.status(200).json({
    attachments: attachments.map((attachment) => ({
      ...attachment.toJSON(),
      createdBy: {
        ...attachment.createdBy.toJSON(),
        photoUrl: attachment.createdBy.toJSON().photo?.src ? genB2Link(attachment.createdBy.toJSON().photo.src) : '',
      },
      fullPath: genB2Link(attachment.src),
    })),
    total,
  });
};

export const createAttachment = async (req, res) => {
  const rs = validateCreateAttachment(req.body);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }

  if (!req.file) {
    return res.status(400).json({
      message: 'File is required',
    });
  }
  try {
    const b2 = req.app.get('b2');
    const { uploadUrl, authorizationToken: uploadAuthToken } = (await b2.getUploadUrl({
      bucketId: blackblazeBucketId,
    })).data;

    const ts = Date.now();
    // Upload original file
    const origin = await uploadFile(b2, uploadUrl, uploadAuthToken, 'image', req, ts);
    // Update preview file
    const attachment = await uploadFile(b2, uploadUrl, uploadAuthToken, 'image', req, ts, origin);

    return res.status(201).json({
      attachment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Error uploading file',
    });
  }
};
export const deleteAttachment = async (req, res) => {
  const rs = validateDeleteAttachment(req.params);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }

  const { attachment_id } = req.params;
  const attachment = await Attachment.findOne({
    _id: attachment_id,
    createdBy: req.user._id,
  });
  if (!attachment) {
    return res.status(404).json({
      message: 'Attachment not found',
    });
  }

  const b2 = req.app.get('b2');

  try {
    await b2.deleteFileVersion({
      fileId: attachment.refId,
      fileName: attachment.src,
    });
  } finally {
    await Attachment.findByIdAndDelete(attachment_id);
  }

  if (attachment.origin) {
    const originAttachment = await Attachment.findOne({
      _id: attachment.origin,
    });

    if (originAttachment) {
      try {
        await b2.deleteFileVersion({
          fileId: originAttachment.refId,
          fileName: originAttachment.src,
        });
      } finally {
        await Attachment.findByIdAndDelete(attachment.origin);
      }
    }
  }

  return res.status(204).json();
};
