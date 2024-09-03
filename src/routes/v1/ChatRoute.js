import { Router } from 'express';
import { auth, imageUpload } from '../../middlewares/index.js';
import {
  getMessages, sendMessage, createRoom, getRooms, deleteRoom, updateRoom,
} from '../../controllers/chat/ChatController.js';

const router = Router();

router.get('/:room_id', auth, getMessages);
router.post('/:room_id', auth, sendMessage);
router.post('/', auth, createRoom);
router.get('/', auth, getRooms);
router.delete('/:room_id', auth, deleteRoom);
router.put('/:room_id', auth, imageUpload(2000000), updateRoom);

export default router;
