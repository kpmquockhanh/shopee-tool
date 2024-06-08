import { Router } from 'express';
import { auth, imageUpload } from '../middlewares/index.js';
import getMessages from '../controllers/chat/get-messages.js';
import sendMessage from '../controllers/chat/create-message.js';
import createRoom from '../controllers/chat/create-room.js';
import getRooms from '../controllers/chat/get-rooms.js';
import deleteRoom from '../controllers/chat/delete-room.js';
import updateRoom from '../controllers/chat/update-room.js';

const router = Router();

router.get('/:room_id', auth, getMessages);
router.post('/:room_id', auth, sendMessage);
router.post('/', auth, createRoom);
router.get('/', auth, getRooms);
router.delete('/:room_id', auth, deleteRoom);
router.put('/:room_id', auth, imageUpload(2000000), updateRoom);

export default router;
