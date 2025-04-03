import { Router } from 'express';
import { auth, imageUpload } from '../../middlewares/index.js';
import {
  createAttachment,
  deleteAttachment, deleteUnusedAttachments,
  getAttachments,
  getUnusedAttachments,
  updateAttachmentVisibility,
} from '../../controllers/attachment/attachment.controller.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

// Public routes
router.get('/public', getAttachments);
router.get('/admin', getAttachments);

// Protected routes
router.get('/', auth, getAttachments);
router.get('/unused', auth, can('remove-duplicates'), getUnusedAttachments);
router.delete('/unused', auth, can('remove-duplicates'), deleteUnusedAttachments);
router.post('/', auth, imageUpload(10000000), createAttachment);
router.delete('/:attachment_id', auth, deleteAttachment);
router.patch('/:attachment_id/visibility', auth, updateAttachmentVisibility);

export default router;
