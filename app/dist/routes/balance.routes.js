"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const balance_controller_1 = require("../controllers/balance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT); // Protect all balance routes
router.get('/', balance_controller_1.BalanceController.getBalance);
router.put('/', balance_controller_1.BalanceController.updateBalance);
exports.default = router;
