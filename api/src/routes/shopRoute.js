import { Router } from 'express';
import { getShopInfo } from '../controllers/shopee/productRoute.js';

const router = Router();

router.get('/get_from_url', getShopInfo);

export default router;
