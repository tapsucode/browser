import { StoreProductModel } from "../models/StoreProduct";
import { StoreCategoryModel } from "../models/StoreCategory";
import { AppError } from "../utils/errors";
import { db } from "../db";

export class StoreService {
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static productCache: Map<string, { data: any; timestamp: number }> =
    new Map();

  static async getProducts(filters?: any) {
    const cacheKey = JSON.stringify(filters || {});
    const cached = this.productCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const products = await StoreProductModel.findAll();
    this.productCache.set(cacheKey, {
      data: products,
      timestamp: Date.now(),
    });

    return products;
  }

  static async purchaseProduct(userId: number, productId: number) {
    const product = await StoreProductModel.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (!product.inStock || (product.quantity !== null && product.quantity <= 0)) {
      throw new AppError("Product out of stock", 400);
    }

    // Create purchase and update stock atomically
    return await db.transaction(async (trx) => {
      // Update stock quantity if available
      if (product.quantity !== null) {
        await StoreProductModel.updateStock(productId, product.inStock, product.quantity - 1);
      }
      return await StoreProductModel.createPurchase(userId, productId);
    });
  }

  static async getProductById(id: number) {
    return StoreProductModel.findById(id);
  }

  static async getCategories() {
    return StoreCategoryModel.findAll();
  }

  static async getFeaturedProducts() {
    return StoreProductModel.findFeatured();
  }

  static async getTags(): Promise<{id: string, name: string, count: number}[]> {

    // Lấy tất cả sản phẩm
    const products = await StoreProductModel.findAll();
    const tagMap = new Map<string, number>();
    
    // Trích xuất tags từ tất cả sản phẩm và đếm số lần sử dụng
    products.forEach((product: any) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => {
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

  // static async purchaseProduct(userId: number, productId: number) {
  //   return StoreProductModel.createPurchase(userId, productId);
  // }

