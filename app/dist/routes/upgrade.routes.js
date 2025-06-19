"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upgrade_controller_1 = require("../controllers/upgrade.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
// Basic routes
router.get("/packages", upgrade_controller_1.UpgradeController.getPackages);
router.get("/packages/:tier/:type", upgrade_controller_1.UpgradeController.getPackageDetails);
router.get("/subscription", upgrade_controller_1.UpgradeController.getCurrentSubscription);
router.post("/calculate-price", upgrade_controller_1.UpgradeController.calculatePrice);
// New routes
router.get("/subscription/history", upgrade_controller_1.UpgradeController.getSubscriptionHistory);
router.post("/preview-upgrade", upgrade_controller_1.UpgradeController.previewUpgrade);
router.post("/change-subscription", upgrade_controller_1.UpgradeController.changeSubscription);
exports.default = router;
