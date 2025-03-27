import { Router } from 'express';
import { getDishes, getDishInfo } from '../../controllers/shopee/ProductController.js';
import { shopeeMiddleware } from '../../middlewares/index.js';

const router = Router();

router.get('/:shop_id', shopeeMiddleware, getDishes);
router.get('/:shop_id/:dish_id/info', shopeeMiddleware, getDishInfo);

export default router;
