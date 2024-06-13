import { Router } from 'express';
import responseHelper from '../utils/helpers/response-helper.js';
import cartRoute from './cartRoute.js';
import productRoute from './productRoute.js';
import shopRoute from './shopRoute.js';
import chatRoute from './chatRoute.js';
import attachmentRoute from './attachmentRoute.js';
import aiRoute from './aiRoute.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(responseHelper(200, 'Welcome to the API'));
});

router.use('/cart', cartRoute);
router.use('/products', productRoute);
router.use('/shops', shopRoute);

router.use('/chat', chatRoute);

router.use('/attachments', attachmentRoute);
router.use('/ai', aiRoute);

export default router;
