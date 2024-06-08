import { Room } from '../../models/index.js';
import { genB2Link } from '../../utils/index.js';

export default async (req, res) => {
  const rooms = await Room.find().populate('thumbnail').limit(50);
  return res.status(200).json({
    rooms: rooms.map((r) => ({
      ...r.toJSON(),
      thumbnail: r.toJSON().thumbnail ? genB2Link(r.toJSON().thumbnail.src) : '',
    })),
  });
};
