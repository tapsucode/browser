import { Router } from "express";
import { DepositController, upload } from "../controllers/deposit.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateJWT);

router.get("/fees", DepositController.getFees);
router.get("/payment-details", DepositController.getPaymentDetails);
router.post("/create", DepositController.createDeposit);
router.post("/process", DepositController.processPayment);
router.get("/transactions", DepositController.getTransactionHistory);
router.get(
  "/transaction/:transactionId",
  DepositController.checkTransactionStatus,
);
router.post(
  "/upload-proof",
  upload.single("paymentProof"),
  DepositController.uploadPaymentProof,
);

export default router;
