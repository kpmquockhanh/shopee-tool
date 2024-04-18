import { Router } from 'express';
// import swaggerJsdoc from 'swagger-jsdoc';
// import { serve, setup } from 'swagger-ui-express';
// import { specs, swaggerConfig } from '../config/index.js';
import v1 from './v1.js';
import userRoute from './user.js';

const router = Router();

// const specDoc = swaggerJsdoc(swaggerConfig);
//
// router.use(specs, serve);
// router.get(specs, setup(specDoc, { explorer: true }));

router.use('/user', userRoute);

router.use('/v1', v1);

export default router;
