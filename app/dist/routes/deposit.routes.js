"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deposit_controller_1 = require("../controllers/deposit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Tất cả routes đều yêu cầu authentication
router.use(auth_middleware_1.authenticateJWT);
router.get("/fees", deposit_controller_1.DepositController.getFees);
router.get("/payment-details", deposit_controller_1.DepositController.getPaymentDetails);
router.post("/create", deposit_controller_1.DepositController.createDeposit);
router.post("/process", deposit_controller_1.DepositController.processPayment);
router.get("/transactions", deposit_controller_1.DepositController.getTransactionHistory);
router.get("/transaction/:transactionId", deposit_controller_1.DepositController.checkTransactionStatus);
router.post("/upload-proof", deposit_controller_1.upload.single("paymentProof"), deposit_controller_1.DepositController.uploadPaymentProof);
exports.default = router;
