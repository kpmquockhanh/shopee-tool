import {
  Attachment, Relationship, Role, User,
} from '../../models/index.js';
import {
  validateCreateAttachment,
  validateDeleteAttachment, validateDeleteUnusedAttachments,
  validateGetAttachment, validateGetUnusedAttachments,
  validateUpdateVisibility,
} from '../../validators/attachment.validator.js';
import { blackblazeBucketId } from '../../config/index.js';
import {
  errorHelper, genB2Link,
} from '../../utils/index.js';
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
  let isAdmin = false;
  let hasSAdminRole = false;
  const { user } = req;

  const sAdminRole = await Role.findOne({
    name: 'SAdmin',
  });

  const adminUsers = await User.find({
    roles: {
      $in: [sAdminRole._id],
    },
  });

  // If this is a public request, only show public attachments
  if (req.path === '/public') {
    const { type } = req.query;
    cond.public = true;
    if (type !== 'all') {
      cond.createdBy = {
        $nin: adminUsers.map((u) => u._id),
      };
    }
  } else if (req.path === '/admin') {
    cond.public = true;
    cond.createdBy = {
      $in: adminUsers.map((u) => u._id),
    };
  } else {
    const listAvailableUserIds = [user._id];
    const userDb = await User.findById(user._id);
    isAdmin = userDb.type === 'admin';

    // Check if user has SAdmin role
    hasSAdminRole = userDb.roles && userDb.roles.includes(sAdminRole._id);

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

    cond.$or = [{
      createdBy: {
        $in: listAvailableUserIds,
      },
    }, { public: true }];
  }

  const attachments = await Attachment
    .find(cond)
    .select({
      name: 1,
      src: 1,
      createdBy: 1,
      width: 1,
      height: 1,
      description: 1,
      public: 1,
      featured: 1,
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
    code: 200,
    data: {
      attachments: attachments.map((attachment) => {
        const isCreator = user && user._id.toString() === attachment.createdBy.toString();
        return {
          ...attachment.toJSON(),
          createdBy: {
            ...attachment.createdBy.toJSON(),
            photoUrl: attachment.createdBy.toJSON().photo?.src
              ? genB2Link(attachment.createdBy.toJSON().photo.src)
              : '',
          },
          fullPath: genB2Link(attachment.src),
          can_delete: isAdmin || hasSAdminRole || isCreator,
        };
      }),
      total,
    },
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

    const rabbitmqConnection = await req.app.get('mqConnection');
    rabbitmqConnection.sendToQueue('new-image', { attachment_id: attachment._id }).then();
    return res.status(201).json({
      code: 200,
      data: {
        attachment,
      },
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
    // createdBy: req.user._id,
  });
  if (!attachment) {
    return res.status(404).json({
      message: 'Attachment not found',
    });
  }

  const { user } = req;
  const userDb = await User.findById(user._id);
  if (userDb.type !== 'admin' && user._id.toString() !== attachment.createdBy.toString()) {
    return res.status(403).json({
      message: 'You are not authorized to delete this attachment',
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

export const getUnusedAttachments = async (req, res) => {
  const rs = validateGetUnusedAttachments(req.query);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const cond = {
    // refId: null,
  };

  const attachments = await Attachment
    .find(cond)
    .select({
      src: 1,
      refId: 1,
      type: 1,
    })
    .sort({ createdAt: -1 })
    .limit(limit || 10)
    .skip((page - 1) * limit);

  const availAttachments = {};
  const filteredAttachmentIds = [];
  const deletedAttachmentIds = [];
  // const endOfSrcToRefId = {};
  const refIdTofileName = {};

  attachments.forEach((attachment) => {
    const endOfSrc = attachment.src.split('/').pop();
    // endOfSrcToRefId[endOfSrc] = attachment.refId;
    refIdTofileName[attachment.refId] = attachment.src;
    if (availAttachments[endOfSrc] === undefined) {
      availAttachments[endOfSrc] = {
        preview: '',
        image: '',
        profile_image: '',
      };
    }

    if (attachment.type === 'preview') {
      availAttachments[endOfSrc].preview = attachment.refId;
    } else if (attachment.type === 'image') {
      availAttachments[endOfSrc].image = attachment.refId;
    } else if (attachment.type === 'profile_image') {
      availAttachments[endOfSrc].profile_image = attachment.refId;
    }
  });

  Object.keys(availAttachments).forEach((fileName) => {
    if (availAttachments[fileName].profile_image) {
      return;
    }
    if (!availAttachments[fileName].preview || !availAttachments[fileName].image) {
      const refId = availAttachments[fileName].image || availAttachments[fileName].preview;
      filteredAttachmentIds.push({
        fileName: refIdTofileName[refId],
        id: refId,
        fullPath: genB2Link(refIdTofileName[refId]),
      });
    }
  });
  const b2 = req.app.get('b2');
  const filenames = await b2.listFileNames({
    bucketId: blackblazeBucketId,
    // maxFileCount: 100,
  });

  filenames.data.files.forEach((filename) => {
    const endOfSrc = filename.fileName.split('/').pop();
    if (availAttachments[endOfSrc]) {
      return;
    }
    deletedAttachmentIds.push({
      fileName: filename.fileName,
      id: filename.fileId,
      fullPath: genB2Link(filename.fileName),
    });
  });

  return res.status(200).json({
    attachments: [...deletedAttachmentIds, ...filteredAttachmentIds],
  });
};

export const deleteUnusedAttachments = async (req, res) => {
  const rs = validateDeleteUnusedAttachments(req.body);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }
  const { ref_id } = req.body;
  const cond = {
    refId: ref_id,
  };

  const attachment = await Attachment
    .findOne(cond)
    .select({
      src: 1,
      refId: 1,
      type: 1,
    });

  if (attachment) {
    await Attachment.deleteOne({
      refId: ref_id,
    });
  }

  try {
    const b2 = req.app.get('b2');
    const fileInfo = await b2.getFileInfo({
      fileId: ref_id,
    }); // returns promise
    await b2.deleteFileVersion({
      fileId: fileInfo.data.fileId,
      fileName: fileInfo.data.fileName,
    });
  } catch (e) {
    if (e.response.data.status === 400) {
      return res.status(400).json(errorHelper('00090', req, e.response.data.message));
    }
    return res.status(500).json(errorHelper('00090', req, e.message));
  }
  return res.status(204).json();
};

export const updateAttachmentVisibility = async (req, res) => {
  const rs = validateUpdateVisibility(req.body);
  if (rs.error) {
    return res.status(400).json(rs.error);
  }

  const { attachment_id } = req.params;
  const { public: isPublic } = req.body;

  const attachment = await Attachment.findOne({
    _id: attachment_id,
  });

  if (!attachment) {
    return res.status(404).json({
      message: 'Attachment not found',
    });
  }

  const { user } = req;
  const userDb = await User.findById(user._id);
  if (userDb.type !== 'admin' && user._id.toString() !== attachment.createdBy.toString()) {
    return res.status(403).json({
      message: 'You are not authorized to update this attachment',
    });
  }

  attachment.public = isPublic;
  await attachment.save();

  return res.status(200).json({
    message: 'Attachment visibility updated successfully',
    attachment,
  });
};
