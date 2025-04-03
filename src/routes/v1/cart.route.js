import { Router } from 'express';
import {
  createNewCart, deleteCart,
  getCartByToken, updateCartItems, deleteCartItems, syncCartItems, deleteAllCart,
} from '../../controllers/shopee/cart.controller.js';
import { cartMiddleware } from '../../middlewares/index.js';

const router = Router();

router.get('/:token', cartMiddleware, getCartByToken);
router.delete('/:token', cartMiddleware, deleteCart);
router.post('/:token/update', cartMiddleware, updateCartItems);
router.delete('/:token/remove', cartMiddleware, deleteCartItems);
router.post('/:token/sync', cartMiddleware, syncCartItems);
router.delete('/:token/delete', cartMiddleware, deleteAllCart);

router.post('/', cartMiddleware, createNewCart);

export default router;
