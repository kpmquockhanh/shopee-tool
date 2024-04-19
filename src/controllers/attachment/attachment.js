import sizeOf from 'buffer-image-size';
import sharp from 'sharp';
import { Attachment } from '../../models/index.js';
import {
  validateCreateAttachment,
  validateDeleteAttachment,
  validateGetAttachment,
} from '../../validators/attachment.validator.js';
import { blackblazeBucketId } from '../../config/index.js';
import { genB2Link } from '../../utils/index.js';

const uploadFile = async (
  b2,
  uploadUrl,
  uploadAuthToken,
  req,
  body,
  ts,
  isPreview = false,
) => {
  let path = `${ts}_${req.file.originalname}`;
  let type = 'image';
  let data = req.file.buffer;
  const contentLength = req.file.size;
  if (isPreview) {
    path = `preview/${path}`;
    type = 'preview';

    data = await sharp(req.file.buffer)
      .jpeg({ quality: 60 })
      .resize(300)
      .toBuffer();
  }

  const resp = await b2.uploadFile({
    uploadUrl,
    uploadAuthToken,
    fileName: path,
    data,
    contentLength,
  });

  const dimensions = sizeOf(data);
  const attachment = new Attachment({
    ...body,
    src: resp.data.fileName,
    createdBy: req.user._id,
    refId: resp.data.fileId,
    width: dimensions.width || 0,
    height: dimensions.height || 0,
    type,
  });
  await attachment.save();
  return { ...(attachment.toJSON()), fullPath: genB2Link(attachment.src) };
};

export const getAttachments = async (req, res) => {
  const rs = validateGetAttachment(req.query);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const attachments = await Attachment
    .find({
      type: {
        $in: ['preview'],
      },
    })
    .select({
      name: 1,
      src: 1,
      createdBy: 1,
      width: 1,
      height: 1,
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name')
    .limit(limit)
    .skip((page - 1) * limit);
  return res.status(200).json({
    attachments: attachments.map((attachment) => {
      attachment._doc.fullPath = genB2Link(attachment.src);
      return attachment;
    }),
  });
};

export const createAttachment = async (req, res) => {
  const rs = validateCreateAttachment(req.body);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }
  const { body } = req;

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
    await uploadFile(b2, uploadUrl, uploadAuthToken, req, body, ts);
    // Update preview file
    const attachment = await uploadFile(b2, uploadUrl, uploadAuthToken, req, body, ts, true);

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
  await b2.deleteFileVersion({
    fileId: attachment.refId,
    fileName: attachment.src,
  });

  await Attachment.findByIdAndDelete(attachment_id);
  return res.status(204).json();
};
