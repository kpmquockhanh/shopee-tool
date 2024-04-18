import { Router } from 'express';
import { auth, checkAdmin, imageUpload } from '../middlewares/index.js';
import { createAttachment, deleteAttachment, getAttachments } from '../controllers/attachment/attachment.js';

const router = Router();

router.get('/', getAttachments);
router.post('/', auth, checkAdmin, imageUpload(10000000), createAttachment);
router.delete('/:attachment_id', auth, checkAdmin, deleteAttachment);

export default router;
