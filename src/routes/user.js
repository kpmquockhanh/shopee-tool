import { Router } from 'express';
import { auth, imageUpload } from '../middlewares/index.js';
import {
  changePassword,
  deleteUser,
  editUser,
  forgotPassword,
  getUser,
  login,
  logout,
  refreshToken,
  register,
  sendVerificationCode,
  verifyEmail,
  loginWithGoogle,
} from '../controllers/user/index.js';

const router = Router();

// AUTH
router.post('/', register);
router.post('/login', login);
router.post('/oauthcallback', loginWithGoogle);
router.post('/logout', auth, logout);
router.post('/verify-email', verifyEmail);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', auth, forgotPassword);
router.post('/send-verification-code', sendVerificationCode);

// EDIT
router.post('/change-password', auth, changePassword);
router.put('/', auth, imageUpload(2000000), editUser);

router.get('/', auth, getUser);
router.delete('/', auth, deleteUser);

export default router;
