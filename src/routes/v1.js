import { Router } from 'express';
import responseHelper from '../utils/helpers/response-helper.js';
import cartRoute from './v1/CartRoute.js';
import productRoute from './v1/ProductRoute.js';
import shopRoute from './v1/ShopeeRoute.js';
import chatRoute from './v1/ChatRoute.js';
import attachmentRoute from './v1/AttachmentRoute.js';
import aiRoute from './v1/AiRoute.js';
import relationshipRoute from './v1/RelationshipRoute.js';
import permissionRoute from './v1/PermissionRoute.js';

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

export default router;
