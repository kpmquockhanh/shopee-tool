import { Router } from 'express';
import responseHelper from '../utils/helpers/response-helper.js';
import cartRoute from './v1/cart.route.js';
import productRoute from './v1/products.route.js';
import shopRoute from './v1/shopee.route.js';
import chatRoute from './v1/chat.route.js';
import attachmentRoute from './v1/attachment.route.js';
import aiRoute from './v1/ai.route.js';
import relationshipRoute from './v1/relationships.route.js';
import permissionRoute from './v1/permissions.route.js';
import commentRoute from './v1/comments.route.js';
import configRoute from './v1/config.route.js';

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
router.use('/friends', relationshipRoute);
router.use('/permissions', permissionRoute);
router.use('/comments', commentRoute);
router.use('/config', configRoute);

export default router;
