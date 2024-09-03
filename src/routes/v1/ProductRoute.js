import { Router } from 'express';
import { getDishes, getDishInfo } from '../../controllers/shopee/ProductController.js';

const router = Router();

router.get('/:shop_id', getDishes);
router.get('/:shop_id/:dish_id/info', getDishInfo);

export default router;
