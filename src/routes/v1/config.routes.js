import express from 'express';
import { processToken } from '../../middlewares/auth/check-auth.js';
import configController from '../../controllers/config/config.controller.js';

const router = express.Router();

// Get user configuration
router.get('/', processToken, configController.getUserConfig);

export default router;
