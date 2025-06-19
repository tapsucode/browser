
import { Router } from 'express';
import { BalanceController } from '../controllers/balance.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT); // Protect all balance routes

router.get('/', BalanceController.getBalance);
router.put('/', BalanceController.updateBalance);

export default router;
