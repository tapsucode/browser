import { Router } from "express";
import { UpgradeController } from "../controllers/upgrade.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateJWT);

// Basic routes
router.get("/packages", UpgradeController.getPackages);
router.get("/packages/:tier/:type", UpgradeController.getPackageDetails);
router.get("/subscription", UpgradeController.getCurrentSubscription);
router.post("/calculate-price", UpgradeController.calculatePrice);

// New routes
router.get("/subscription/history", UpgradeController.getSubscriptionHistory);
router.post("/preview-upgrade", UpgradeController.previewUpgrade);
router.post("/change-subscription", UpgradeController.changeSubscription);

export default router;
