import { Room } from '../../models/index.js';

export default async (req, res) => {
  const rooms = await Room.find().limit(50);
  return res.status(200).json({
    rooms,
  });
};
