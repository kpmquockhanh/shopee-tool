import { Router } from 'express';
import responseHelper from '../utils/helpers/response-helper.js';
import { getDishes } from '../controllers/shopee/productRoute.js';
import { shopeeMiddleware } from '../middlewares/index.js';
import cartRoute from './cartRoute.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(responseHelper(200, 'Welcome to the API'));
});

router.get('/dishes', ...[shopeeMiddleware], getDishes);

router.use('/cart', cartRoute);

export default router;
