import { Router } from 'express';
import { auth, imageUpload } from '../middlewares/index.js';
import { createAttachment, deleteAttachment, getAttachments } from '../controllers/attachment/attachment.js';

const router = Router();

router.get('/', auth, getAttachments);
router.post('/', auth, imageUpload(10000000), createAttachment);
router.delete('/:attachment_id', auth, deleteAttachment);

export default router;
