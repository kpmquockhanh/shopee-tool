import { Router } from 'express';
import { getShopInfo } from '../../controllers/shopee/ProductController.js';

const router = Router();

router.get('/get_from_url', getShopInfo);

export default router;
