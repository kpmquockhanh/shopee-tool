import { Router } from 'express';
import { auth } from '../middlewares/index.js';
import {
  acceptInvitation, getFriends, inviteFriend, removeFriend, getInvitations, declineInvitation, searchFriends,
} from '../controllers/friend/friend.js';

const router = Router();

router.get('/', auth, getFriends);
router.get('/find', auth, searchFriends);
router.post('/invite', auth, inviteFriend);
router.post('/accept', auth, acceptInvitation);
router.post('/decline', auth, declineInvitation);
router.get('/invitations', auth, getInvitations);
router.delete('/remove', auth, removeFriend);

export default router;
