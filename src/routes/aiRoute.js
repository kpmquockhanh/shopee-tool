import { Router } from 'express';
import { imageUpload } from '../middlewares/index.js';
import predict from '../controllers/ai/predict-digit.js';

const router = Router();

router.post('/', imageUpload(10000000), predict);

export default router;
