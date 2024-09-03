import { Router } from 'express';
import { auth } from '../../middlewares/index.js';
import {
  acceptInvitation,
  declineInvitation,
  getFriends,
  getInvitations,
  inviteFriend,
  removeFriend,
  searchFriends,
} from '../../controllers/friend/FriendController.js';

const router = Router();

router.get('/', auth, getFriends);
router.get('/find', auth, searchFriends);
router.post('/invite', auth, inviteFriend);
router.post('/accept', auth, acceptInvitation);
router.post('/decline', auth, declineInvitation);
router.get('/invitations', auth, getInvitations);
router.delete('/remove', auth, removeFriend);

export default router;
