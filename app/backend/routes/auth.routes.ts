import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', authenticateJWT, AuthController.getCurrentUser);
router.post('/logout', authenticateJWT, AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/verify-token', AuthController.verifyToken);
router.patch('/user', authenticateJWT, AuthController.updateUser);
router.get('/user', authenticateJWT, AuthController.getCurrentUser);

export default router;
