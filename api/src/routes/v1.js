import { Router } from 'express';
import responseHelper from '../utils/helpers/response-helper.js';
import cartRoute from './cartRoute.js';
import productRoute from './productRoute.js';
import shopRoute from './shopRoute.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(responseHelper(200, 'Welcome to the API'));
});

router.use('/cart', cartRoute);
router.use('/products', productRoute);
router.use('/shops', shopRoute);

export default router;
