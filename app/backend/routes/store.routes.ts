import { Router } from "express";
import { StoreController } from "../controllers/store.controller";

import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateJWT);

// Public routes
router.get("/products", StoreController.getProducts);
router.get("/products/search", StoreController.searchProducts);
router.get(
  "/products/category/:categoryId",
  StoreController.getProductsByCategory,
);
router.get("/products/featured", StoreController.getFeaturedProducts);
router.get("/products/:id", StoreController.getProductDetails);
router.get("/products/:id/reviews", StoreController.getProductReviews);
router.get("/categories", StoreController.getCategories);

// Protected routes

router.get("/products/installed", StoreController.getInstalledProducts);
router.post("/products/:id/purchase", StoreController.purchaseProduct);
router.post("/products/:id/install", StoreController.installProduct);
router.post("/products/:id/uninstall", StoreController.uninstallProduct);
router.post("/products/:id/rate", StoreController.rateProduct);

export default router;
