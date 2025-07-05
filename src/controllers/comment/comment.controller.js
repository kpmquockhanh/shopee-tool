import { Comment, User } from '../../models/index.js';
import { errorHelper, genB2Link } from '../../utils/index.js';
import timeDiff from '../../utils/helpers/time-helper.js';

// Add can_delete field to comments
const processComments = (
  req,
  commentList,
  user,
  isChild = false,
  isRawDate = false,
) => commentList.map((comment) => {
  let commentObj;
  if (!isChild) {
    commentObj = comment.toObject();
  } else {
    commentObj = comment;
  }

  const userId = user?._id ?? -1;
  if (user) {
    const roles = user.roles.map((r) => r.name);
    commentObj.can_delete = comment.user?._id.toString() === userId.toString() || roles.some((r) => r === 'SAdmin');
  } else {
    commentObj.can_delete = false;
  }

  commentObj.can_reply = true;

  if (commentObj.comments && commentObj.comments.length > 0) {
    commentObj.comments = processComments(req, commentObj.comments, user, true);
  }

  if (commentObj.user) {
    commentObj.user.photoUrl = commentObj.user.photo?.src
      ? genB2Link(commentObj.user.photo.src)
      : '';
  }

  commentObj.uuid = commentObj._id;
  commentObj.created_at = isRawDate ? commentObj.createdAt : timeDiff(commentObj.createdAt, req.query.lang || 'vi');
  delete commentObj.__v;
  delete commentObj._id;
  delete commentObj.createdAt;
  delete commentObj.updatedAt;
  return commentObj;
});

export const createComment = async (req, res) => {
  try {
    const {
      name, comment, gif_url, id, presence,
    } = req.body;
    const newComment = await Comment.create({
      name,
      comment,
      gif_url,
      parent_id: id,
      presence,
      user: req.user?._id || null,
    });

    if (id) {
      await Comment.findByIdAndUpdate(id, {
        $push: { comments: newComment._id },
      });
    }

    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'name email')
      .populate({
        path: 'comments',
        populate: {
          path: 'comments',
        },
      });

    let processedComments = [];
    if (req.user) {
      const dbUser = await User.findById(req.user._id).populate('roles').select('roles');
      processedComments = processComments(req, [populatedComment], dbUser, false, true);
    } else {
      processedComments = processComments(req, [populatedComment], req.user, false, true);
    }

    return res.status(201).json({
      code: 201,
      data: processedComments[0],
    });
  } catch (err) {
    return res.status(500).json(errorHelper('00013', req, err.message));
  }
};

export const createPostComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, gif_url, presence } = req.body;

    const newComment = await Comment.create({
      name: req.user?.name || 'Anonymous',
      comment,
      gif_url,
      presence,
      ref_id: id,
      ref_type: 'post',
      user: req.user?._id || null,
    });

    const commentObj = await Comment.findById(newComment._id)
    .populate({
      path: 'user',
      select: 'name email',
      populate: {
        path: 'photo',
        select: 'src',
      },
    })
    .populate({
      path: 'comments',
      populate: [
        {
          path: 'user',
          select: 'name email',
        },
        {
          path: 'comments',
          populate: {
            path: 'user',
            select: 'name email',
          },
        },
      ],
    })

    let processedComments = [];
    if (req.user) {
      const dbUser = await User.findById(req.user._id).populate('roles').select('roles');
      processedComments = processComments(req, [commentObj], dbUser, false, true);
    } else {
      processedComments = processComments(req, [commentObj], req.user, false, true);
    }

    return res.status(201).json({
      code: 201,
      data: processedComments[0],
    });
  } catch (err) {
    return res.status(500).json(errorHelper('00013', req, err.message));
  }
};

export const getPostComments = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.limit, 10) || 10;
    const skipCount = (currentPage - 1) * pageSize;

    const conditions = {
      parent_id: null,
      ref_type: 'post',
    };
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(errorHelper('00021', req, 'Ref ID is required'));
    }

    conditions.ref_id = id;

    const totalComments = await Comment.countDocuments(conditions);

    const comments = await Comment.find(conditions)
      .populate({
        path: 'user',
        select: 'name email',
        populate: {
          path: 'photo',
          select: 'src',
        },
      })
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'user',
            select: 'name email',
          },
          {
            path: 'comments',
            populate: {
              path: 'user',
              select: 'name email',
            },
          },
        ],
      })
      .sort({ createdAt: 1 })
      .skip(skipCount)
      .limit(pageSize);

    let processedComments = [];
    if (req.user) {
      const dbUser = await User.findById(req.user._id).populate('roles').select('roles');
      processedComments = processComments(req, comments, dbUser, false, true);
    } else {
      processedComments = processComments(req, comments, req.user, false, true);
    }

    return res.status(200).json({
      code: 200,
      data: {
        comments: processedComments,
        pagination: {
          total: totalComments,
          page: currentPage,
          limit: pageSize,
          totalPages: Math.ceil(totalComments / pageSize),
        },
      },

    });
  } catch (err) {
    console.log('KPM err', err);
    return res.status(500).json(errorHelper('00014', req, err.message));
  }
};

export const getComments = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.limit, 10) || 10;
    const skipCount = (currentPage - 1) * pageSize;

    const totalComments = await Comment.countDocuments({ parent_id: null });

    const comments = await Comment.find({ parent_id: null })
      .populate('user', 'name email')
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'user',
            select: 'name email',
          },
          {
            path: 'comments',
            populate: {
              path: 'user',
              select: 'name email',
            },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(pageSize);

    let processedComments = [];
    if (req.user) {
      const dbUser = await User.findById(req.user._id).populate('roles').select('roles');
      processedComments = processComments(req, comments, dbUser, false, true);
    } else {
      processedComments = processComments(req, comments, req.user, false, true);
    }

    return res.status(200).json({
      code: 200,
      data: {
        comments: processedComments,
        pagination: {
          total: totalComments,
          page: currentPage,
          limit: pageSize,
          totalPages: Math.ceil(totalComments / pageSize),
        },
      },

    });
  } catch (err) {
    return res.status(500).json(errorHelper('00014', req, err.message));
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json(errorHelper('00018', req, 'Comment not found'));
    }

    const dbUser = await User.findById(req.user._id).populate('roles').select('roles');
    const roles = dbUser.roles.map((r) => r.name);
    console.log('KPM roles', roles);

    if (comment.user?.toString() !== req.user._id.toString() && !roles.some((r) => r === 'SAdmin')) {
      return res.status(403).json(errorHelper('00019', req, 'Unauthorized'));
    }

    // Function to recursively get all child comment IDs
    const getAllChildIds = async (commentId) => {
      const currentComment = await Comment.findById(commentId);
      if (!currentComment) return [];

      let childIds = [];
      if (currentComment.comments && currentComment.comments.length > 0) {
        // Get all direct child IDs
        childIds = [...currentComment.comments];

        // Recursively get IDs of all nested comments
        const nestedIds = await Promise.all(
          currentComment.comments.map((childId) => getAllChildIds(childId)),
        );
        childIds = [...childIds, ...nestedIds.flat()];
      }
      return childIds;
    };

    // Get all child comment IDs (including deeply nested ones)
    const allChildIds = await getAllChildIds(id);

    // Remove comment from parent's comments array if it has a parent
    if (comment.parent_id) {
      await Comment.findByIdAndUpdate(comment.parent_id, {
        $pull: { comments: comment._id },
      });
    }

    // Delete all child comments (including deeply nested ones)
    if (allChildIds.length > 0) {
      await Comment.deleteMany({
        _id: { $in: allChildIds },
      });
    }

    // Delete the comment itself
    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      code: 200,
      data: {
        message: 'Comment deleted successfully',
        status: true,
      },
    });
  } catch (err) {
    return res.status(500).json(errorHelper('00020', req, err.message));
  }
};
