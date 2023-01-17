import { Router } from 'express';
import { cartMiddleware, shopeeMiddleware } from '../middlewares/index.js';
import {
  addToCartByToken,
  createNewCart,
  getCart,
  getCartByToken,
  removeCart,
  syncCart,
} from '../controllers/shopee/cartRoute.js';

const router = Router();

router.delete('/remove', ...[cartMiddleware], removeCart);
router.get('/', ...[cartMiddleware], getCart);

router.get('/sync', ...[shopeeMiddleware, cartMiddleware], syncCart);

router.get('/:token', ...[cartMiddleware], getCartByToken);
router.post('/:token/add', ...[cartMiddleware], addToCartByToken);

router.post('/init', ...[cartMiddleware], createNewCart);

export default router;
