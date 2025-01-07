import { Router } from 'express';
import { auth, imageUpload } from '../../middlewares/index.js';
import {
  createAttachment,
  deleteAttachment, deleteUnusedAttachments,
  getAttachments,
  getUnusedAttachments,
} from '../../controllers/attachment/AttachmentController.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

router.get('/', auth, getAttachments);

router.get('/unused', auth, can('remove-duplicates'), getUnusedAttachments);
router.delete('/unused', auth, can('remove-duplicates'), deleteUnusedAttachments);

router.post('/', auth, imageUpload(10000000), createAttachment);
router.delete('/:attachment_id', auth, deleteAttachment);

export default router;
