import { Router } from 'express';
import {
  createNewCart, deleteCart,
  getCartByToken, updateCartItems, deleteCartItems, syncCartItems,
} from '../controllers/shopee/cartRoute.js';
import { cartMiddleware } from '../middlewares/index.js';

const router = Router();

router.get('/:token', cartMiddleware, getCartByToken);
router.delete('/:token', cartMiddleware, deleteCart);
router.post('/:token/update', cartMiddleware, updateCartItems);
router.delete('/:token/remove', cartMiddleware, deleteCartItems);
router.post('/:token/sync', cartMiddleware, syncCartItems);

router.post('/', cartMiddleware, createNewCart);

export default router;
