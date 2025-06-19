"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
// Public routes
router.get("/products", store_controller_1.StoreController.getProducts);
router.get("/products/search", store_controller_1.StoreController.searchProducts);
router.get("/products/category/:categoryId", store_controller_1.StoreController.getProductsByCategory);
router.get("/products/featured", store_controller_1.StoreController.getFeaturedProducts);
router.get("/products/:id", store_controller_1.StoreController.getProductDetails);
router.get("/products/:id/reviews", store_controller_1.StoreController.getProductReviews);
router.get("/categories", store_controller_1.StoreController.getCategories);
// Protected routes
router.get("/products/installed", store_controller_1.StoreController.getInstalledProducts);
router.post("/products/:id/purchase", store_controller_1.StoreController.purchaseProduct);
router.post("/products/:id/install", store_controller_1.StoreController.installProduct);
router.post("/products/:id/uninstall", store_controller_1.StoreController.uninstallProduct);
router.post("/products/:id/rate", store_controller_1.StoreController.rateProduct);
exports.default = router;
