import { Relationship, User } from '../../models/index.js';
import { errorHelper, genB2Link } from '../../utils/index.js';
import {
  validateAcceptFriend,
  validateDeclineFriend, validateFindFriends,
  validateInviteFriend,
} from '../../validators/relationship.validator.js';

export const getFriends = async (req, res) => {
  // find origin or target is user
  const relationships = await Relationship
    .find({
      $or: [{ origin: req.user._id }, { target: req.user._id }],
      type: 'friend',
      status: 'accepted',
    })
    .populate([
      {
        path: 'origin',
        populate: {
          path: 'photo',
        },
      }, {
        path: 'target',
        populate: {
          path: 'photo',
        },
      }]).limit(10);
  const { user } = req;

  const friends = relationships.map((r) => {
    if (r.origin._id.toString() !== user._id.toString()) {
      const img = r.origin?.photo?.src ? genB2Link(r.origin.photo.src) : '';
      return {
        ...r.origin.toJSON(),
        type: 'friend',
        photoUrl: img,
      };
    }
    const img = r.target?.photo?.src ? genB2Link(r.target.photo.src) : '';
    return {
      ...r.target.toJSON(),
      type: 'friend',
      photoUrl: img,
    };
  });

  return res.status(200).json({
    friends,
  });
};

export const searchFriends = async (req, res) => {
  const { error } = validateFindFriends(req.query);
  if (error) {
    return res.status(400).json(errorHelper('00001', req, error.details[0].message));
  }

  const { q } = req.query;

  const users = await User.find({
    $or: [
      {
        name: { $regex: q, $options: 'i' },
      },
      {
        username: { $regex: q, $options: 'i' },
      },
      {
        email: { $regex: q, $options: 'i' },
      },
    ],
  })
    .populate('photo')
    .limit(10);

  return res.status(200).json({
    users: users.map((u) => ({
      ...u.toJSON(),
      photoUrl: u.photo?.src ? genB2Link(u.photo.src) : '',
    })),
  });
};

export const getInvitations = async (req, res) => {
  const { user } = req;
  const relationships = await Relationship
    .find({ target: user._id, type: 'friend', status: 'pending' })
    .populate([
      {
        path: 'origin',
        populate: {
          path: 'photo',
        },
      },
    ])
    .limit(10);
  return res.status(200).json({
    invitations: relationships.map((r) => ({
      ...r.toJSON(),
      photoUrl: r.origin?.photo?.src ? genB2Link(r.origin.photo.src) : '',
    })),
  });
};

export const inviteFriend = async (req, res) => {
  const { error } = validateInviteFriend(req.body);
  if (error) {
    return res.status(400).json(errorHelper('00001', req, error.details[0].message));
  }

  const { user } = req;
  const { target } = req.body;

  if (target === user._id) return res.status(400).json(errorHelper('00004', req));
  // Check target exists
  const exists = await User.exists({ _id: target }).catch((err) => res.status(500).json(errorHelper('00005', req, err.message)));
  if (!exists) return res.status(400).json(errorHelper('00006', req, 'User not found'));

  const relationship = await Relationship
    .findOne({
      $or: [
        { origin: req.user._id, target },
        { target: req.user._id, origin: target },
      ],
    })
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));

  if (relationship) {
    if (relationship.status === 'accepted') return res.status(409).json(errorHelper('00003', req, 'Already friend'));
    if (relationship.status === 'pending') return res.status(409).json(errorHelper('00003', req, 'Already sent request'));
  }

  const friend = await Relationship.create({
    origin: user._id,
    target,
    type: 'friend',
    status: 'pending',
  });
  return res.status(200).json({
    invitation: friend,
  });
};

export const acceptInvitation = async (req, res) => {
  const { error } = validateAcceptFriend(req.body);
  if (error) {
    return res.status(400).json(errorHelper('00001', req, error.details[0].message));
  }
  const { user } = req;
  const { id } = req.body;
  // Check invitation exists
  const exists = await Relationship
    .exists({
      _id: id, target: user._id, type: 'friend', status: 'pending',
    })
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));
  if (!exists) return res.status(404).json(errorHelper('00007', req, 'Invitation not found'));

  await Relationship
    .findByIdAndUpdate(id, { $set: { status: 'accepted' } })
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));

  const friend = await Relationship
    .findById(id)
    .populate(['origin', 'target'])
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));
  return res.status(200).json({
    result: friend,
  });
};

export const declineInvitation = async (req, res) => {
  const { error } = validateDeclineFriend(req.body);
  if (error) {
    return res.status(400).json(errorHelper('00001', req, error.details[0].message));
  }
  const { user } = req;
  const { id } = req.body;

  // Check invitation exists
  const exists = await Relationship
    .exists({
      _id: id, target: user._id, type: 'friend', status: 'pending',
    })
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));
  if (!exists) return res.status(404).json(errorHelper('00007', req, 'Invitation not found'));

  await Relationship
    .findByIdAndUpdate(id, { $set: { status: 'declined' } })
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));

  const friend = await Relationship
    .findById(id)
    .populate(['origin', 'target'])
    .catch((err) => res.status(500).json(errorHelper('00002', req, err.message)));
  return res.status(200).json({
    result: friend,
  });
};

export const removeFriend = async (req, res) => {
  const friends = [];
  return res.status(200).json({
    friends,
  });
};
