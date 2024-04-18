import { Room } from '../../models/index.js';
import { validateCreateRoom } from '../../validators/chat.validator.js';
import { errorHelper } from '../../utils/index.js';

export default async (req, res) => {
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
