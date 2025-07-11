import sharp from 'sharp';
import { subFolder } from '../../config/index.js';
import { Attachment } from '../../models/index.js';

export const genB2Link = (url) => {
  if (!url) return null;

  // optimize image now moved to cloudflare images
  // return `${blackblazeBucketUrl}${url}`;
  return url;
};

export const uploadFile = async (
  b2,
  uploadUrl,
  uploadAuthToken,
  type,
  req,
  ts,
  // origin = null,
) => {
  let path = `${ts}_${req.file.originalname}`;

  if (subFolder) {
    path = `${subFolder}/${path}`;
  }
  const { data, info } = await sharp(
    req.file.buffer,
    { pages: -1 },
  )
    .toBuffer({ resolveWithObject: true });
  // let originId = null;
  // if (origin) {
  //   path = `preview/${path}`;
  //   type = 'preview';
  //   originId = origin._id;
  //
  //   const obj = await sharp(req.file.buffer, { pages: -1 })
  //     .jpeg({ quality: 45 })
  //     .rotate()
  //     .resize(info.width > 300 ? 300 : parseInt(info.width * 0.8, 10))
  //     .toFormat(info.format)
  //     .toBuffer({ resolveWithObject: true });
  //   data = obj.data;
  //   info = obj.info;
  // }

  const contentLength = data.size;

  const resp = await b2.uploadFile({
    uploadUrl,
    uploadAuthToken,
    fileName: path,
    data,
    contentLength,
  });

  const attachment = new Attachment({
    ...req.body,
    src: resp.data.fileName,
    createdBy: req.user._id,
    refId: resp.data.fileId,
    width: info.width || 0,
    height: (info.height || 0) / (info.pages || 1),
    type,
    // origin: originId,
  });
  await attachment.save();

  return Attachment.findById(attachment._id).populate({
    path: 'createdBy',
    select: 'name photo',
    populate: {
      path: 'photo',
      select: 'src',
    },
  });
};
