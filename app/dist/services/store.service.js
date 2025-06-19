"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const StoreProduct_1 = require("../models/StoreProduct");
const StoreCategory_1 = require("../models/StoreCategory");
const errors_1 = require("../utils/errors");
const db_1 = require("../db");
class StoreService {
    static async getProducts(filters) {
        const cacheKey = JSON.stringify(filters || {});
        const cached = this.productCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        const products = await StoreProduct_1.StoreProductModel.findAll();
        this.productCache.set(cacheKey, {
            data: products,
            timestamp: Date.now(),
        });
        return products;
    }
    static async purchaseProduct(userId, productId) {
        const product = await StoreProduct_1.StoreProductModel.findById(productId);
        if (!product) {
            throw new errors_1.AppError("Product not found", 404);
        }
        if (!product.inStock || (product.quantity !== null && product.quantity <= 0)) {
            throw new errors_1.AppError("Product out of stock", 400);
        }
        // Create purchase and update stock atomically
        return await db_1.db.transaction(async (trx) => {
            // Update stock quantity if available
            if (product.quantity !== null) {
                await StoreProduct_1.StoreProductModel.updateStock(productId, product.inStock, product.quantity - 1);
            }
            return await StoreProduct_1.StoreProductModel.createPurchase(userId, productId);
        });
    }
    static async getProductById(id) {
        return StoreProduct_1.StoreProductModel.findById(id);
    }
    static async getCategories() {
        return StoreCategory_1.StoreCategoryModel.findAll();
    }
    static async getFeaturedProducts() {
        return StoreProduct_1.StoreProductModel.findFeatured();
    }
    static async getTags() {
        // Lấy tất cả sản phẩm
        const products = await StoreProduct_1.StoreProductModel.findAll();
        const tagMap = new Map();
        // Trích xuất tags từ tất cả sản phẩm và đếm số lần sử dụng
        products.forEach((product) => {
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach((tag) => {
                    const trimmedTag = tag.trim();
                    if (trimmedTag) {
                        tagMap.set(trimmedTag, (tagMap.get(trimmedTag) || 0) + 1);
                    }
                });
            }
        });
        // Chuyển thành format mong muốn
        const tags = Array.from(tagMap.entries()).map(([name, count], index) => ({
            id: `tag-${index + 1}`,
            name,
            count
        }));
        // Sắp xếp theo số lượng sử dụng (nhiều nhất trước)
        tags.sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return a.name.localeCompare(b.name);
        });
        return tags;
    }
}
exports.StoreService = StoreService;
StoreService.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
StoreService.productCache = new Map();
// static async purchaseProduct(userId: number, productId: number) {
//   return StoreProductModel.createPurchase(userId, productId);
// }
