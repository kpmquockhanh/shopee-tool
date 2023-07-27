import { Router } from 'express';
import { getDishes } from '../controllers/shopee/productRoute.js';

const router = Router();

router.get('/:shop_id', getDishes);

export default router;
