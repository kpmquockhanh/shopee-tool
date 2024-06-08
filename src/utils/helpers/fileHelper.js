import sharp from 'sharp';
import sizeOf from 'buffer-image-size';
import { blackblazeBucketUrl, subFolder } from '../../config/index.js';
import { Attachment } from '../../models/index.js';

// eslint-disable-next-line import/prefer-default-export
export const genB2Link = (url) => {
  if (!url) return null;
  return `${blackblazeBucketUrl}${url}`;
};

export const uploadFile = async (
  b2,
  uploadUrl,
  uploadAuthToken,
  type,
  req,
  ts,
  origin = null,
) => {
  let path = `${ts}_${req.file.originalname}`;

  if (subFolder) {
    path = `${subFolder}/${path}`;
  }
  let data = req.file.buffer;
  const contentLength = req.file.size;
  let originId = null;
  if (origin) {
    path = `preview/${path}`;
    type = 'preview';
    originId = origin._id;

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
    ...req.body,
    src: resp.data.fileName,
    createdBy: req.user._id,
    refId: resp.data.fileId,
    width: dimensions.width || 0,
    height: dimensions.height || 0,
    type,
    origin: originId,
  });
  await attachment.save();
  return { ...(attachment.toJSON()), fullPath: genB2Link(attachment.src) };
};
