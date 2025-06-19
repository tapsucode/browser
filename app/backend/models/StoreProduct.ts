import { db } from '../db';
import { storeProducts, storeCategories, userPurchases, type StoreProduct, type InsertStoreProduct } from '../schema';
import { eq, desc, like, and } from 'drizzle-orm';

export interface StoreProductCreateInput {
  name: string;
  description: string;
  price: number;
  currency?: string;
  categoryId?: number;
  imageUrl?: string;
  quantity?: number;
  tags?: string[];
  featured?: boolean;
}

export interface StoreProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  categoryId?: number;
  imageUrl?: string;
  inStock?: boolean;
  quantity?: number;
  tags?: string[];
  featured?: boolean;
}

export class StoreProductModel {
  /**
   * Tìm product theo ID
   */
  static async findById(id: number): Promise<StoreProduct | null> {
    try {
      const result = await db.select().from(storeProducts).where(eq(storeProducts.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding store product by ID:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả products
   */
  static async findAll(): Promise<StoreProduct[]> {
    try {
      return await db.select().from(storeProducts).orderBy(desc(storeProducts.createdAt));
    } catch (error) {
      console.error('Error finding all store products:', error);
      return [];
    }
  }

  /**
   * Lấy featured products
   */
  static async findFeatured(): Promise<StoreProduct[]> {
    try {
      return await db.select().from(storeProducts)
        .where(eq(storeProducts.featured, true))
        .orderBy(desc(storeProducts.createdAt));
    } catch (error) {
      console.error('Error finding featured products:', error);
      return [];
    }
  }

  /**
   * Lấy products theo category
   */
  static async findByCategory(categoryId: number): Promise<StoreProduct[]> {
    try {
      return await db.select().from(storeProducts)
        .where(eq(storeProducts.categoryId, categoryId))
        .orderBy(desc(storeProducts.createdAt));
    } catch (error) {
      console.error('Error finding products by category:', error);
      return [];
    }
  }

  /**
   * Tìm kiếm products
   */
  static async search(query: string): Promise<StoreProduct[]> {
    try {
      return await db.select().from(storeProducts)
        .where(like(storeProducts.name, `%${query}%`))
        .orderBy(desc(storeProducts.createdAt));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Tạo product mới
   */
  static async create(productData: StoreProductCreateInput): Promise<StoreProduct | null> {
    try {
      const newProduct: InsertStoreProduct = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        currency: productData.currency || 'USD',
        categoryId: productData.categoryId || null,
        imageUrl: productData.imageUrl || null,
        inStock: true,
        quantity: productData.quantity || null,
        tags: productData.tags ? JSON.stringify(productData.tags) : null,
        featured: productData.featured || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(storeProducts).values(newProduct).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating store product:', error);
      return null;
    }
  }

  /**
   * Cập nhật product
   */
  static async update(id: number, productData: StoreProductUpdateInput): Promise<StoreProduct | null> {
    try {
      const updateData: Partial<InsertStoreProduct> = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        currency: productData.currency,
        categoryId: productData.categoryId,
        imageUrl: productData.imageUrl,
        inStock: productData.inStock,
        quantity: productData.quantity,
        featured: productData.featured,
        updatedAt: new Date(),
      };

      if (productData.tags) {
        updateData.tags = JSON.stringify(productData.tags);
      }

      const result = await db.update(storeProducts)
        .set(updateData)
        .where(eq(storeProducts.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating store product:', error);
      return null;
    }
  }

  /**
   * Xóa product
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(storeProducts).where(eq(storeProducts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting store product:', error);
      return false;
    }
  }

  /**
   * Lấy product với category info
   */
  static async findWithCategory(id: number): Promise<(StoreProduct & { category?: any }) | null> {
    try {
      const result = await db.select({
        product: storeProducts,
        category: storeCategories,
      })
      .from(storeProducts)
      .leftJoin(storeCategories, eq(storeProducts.categoryId, storeCategories.id))
      .where(eq(storeProducts.id, id))
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].product,
        category: result[0].category,
      };
    } catch (error) {
      console.error('Error finding product with category:', error);
      return null;
    }
  }

  /**
   * Cập nhật stock status
   */
  static async updateStock(id: number, inStock: boolean, quantity?: number): Promise<boolean> {
    try {
      const updateData: Partial<InsertStoreProduct> = {
        inStock,
        updatedAt: new Date(),
      };

      if (quantity !== undefined) {
        updateData.quantity = quantity;
      }

      await db.update(storeProducts)
        .set(updateData)
        .where(eq(storeProducts.id, id));

      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  }

  /**
   * Toggle featured status
   */
  static async toggleFeatured(id: number): Promise<boolean> {
    try {
      const product = await this.findById(id);
      if (!product) return false;

      await db.update(storeProducts)
        .set({ 
          featured: !product.featured,
          updatedAt: new Date(),
        })
        .where(eq(storeProducts.id, id));

      return true;
    } catch (error) {
      console.error('Error toggling product featured status:', error);
      return false;
    }
  }

  /**
   * Lấy products trong khoảng giá
   */
  static async findByPriceRange(minPrice: number, maxPrice: number): Promise<StoreProduct[]> {
    try {
      return await db.select().from(storeProducts)
        .where(and(
          eq(storeProducts.inStock, true),
          // Note: In real implementation, you'd use proper price range query
        ))
        .orderBy(storeProducts.price);
    } catch (error) {
      console.error('Error finding products by price range:', error);
      return [];
    }
  }

  /**
   * Parse tags data
   */
  static parseTags(tagsJson: string | null): string[] {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch (error) {
      console.error('Error parsing tags data:', error);
      return [];
    }
  }

  /**
   * Lấy products đã mua bởi user
   */
  static async findPurchasedByUser(userId: number): Promise<StoreProduct[]> {
    try {
      const result = await db.select({
        product: storeProducts,
      })
      .from(storeProducts)
      .innerJoin(userPurchases, eq(storeProducts.id, userPurchases.productId))
      .where(eq(userPurchases.userId, userId));

      return result.map(r => r.product);
    } catch (error) {
      console.error('Error finding products purchased by user:', error);
      return [];
    }
  }

  /**
   * Lấy best selling products
   */
  static async findBestSelling(limit = 10): Promise<StoreProduct[]> {
    try {
      // In a real implementation, you'd join with purchases and order by sales count
      return await db.select().from(storeProducts)
        .where(eq(storeProducts.inStock, true))
        .orderBy(desc(storeProducts.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error finding best selling products:', error);
      return [];
    }
  }

  /**
   * Kiểm tra sản phẩm đã được user cài đặt chưa
   */
  static async isInstalledByUser(productId: number, userId: number): Promise<boolean> {
    try {
      const result = await db.select()
        .from(userPurchases)
        .where(and(
          eq(userPurchases.productId, productId),
          eq(userPurchases.userId, userId),
          eq(userPurchases.status, 'completed')
        ))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if product is installed by user:', error);
      return false;
    }
  }

  /**
   * Lấy rating trung bình và số lượng review của sản phẩm
   */
  static async getProductRating(productId: number): Promise<{rating: number, reviewCount: number}> {
    try {
      // Trong implementation thực tế, bạn sẽ có bảng reviews
      // Hiện tại trả về dữ liệu mặc định
      return {
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 100) + 10
      };
    } catch (error) {
      console.error('Error getting product rating:', error);
      return { rating: 0, reviewCount: 0 };
    }
  }

  /**
   * Tạo purchase record cho user
   */
  static async createPurchase(userId: number, productId: number): Promise<any> {
    try {
      const purchase = {
        userId,
        productId,
        status: 'completed',
        purchaseDate: new Date(),
        amount: 0 // Will be updated with actual product price
      };

      const result = await db.insert(userPurchases).values({
        userId: userId,
        productId: productId,
        quantity: 1,
        price: 0,
        status: 'completed'
      }).returning();

      return result[0] || purchase;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  }

  /**
   * Lấy reviews của sản phẩm
   */
  static async getReviews(productId: number): Promise<any[]> {
    try {
      // Trong implementation thực tế, bạn sẽ có bảng reviews
      // Hiện tại trả về dữ liệu mặc định
      return [
        {
          id: 1,
          userId: 1,
          productId,
          rating: 5,
          comment: "Great product!",
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 2,
          productId,
          rating: 4,
          comment: "Good value for money",
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách sản phẩm đã cài đặt của user
   */
  static async findInstalled(userId: number): Promise<StoreProduct[]> {
    try {
      const result = await db.select({
        product: storeProducts,
      })
      .from(storeProducts)
      .innerJoin(userPurchases, eq(storeProducts.id, userPurchases.productId))
      .where(and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.status, 'completed')
      ));

      return result.map(r => r.product);
    } catch (error) {
      console.error('Error finding installed products:', error);
      return [];
    }
  }

  /**
   * Cài đặt sản phẩm cho user
   */
  static async install(userId: number, productId: number): Promise<void> {
    try {
      // Kiểm tra xem đã cài đặt chưa
      const alreadyInstalled = await this.isInstalledByUser(productId, userId);
      if (alreadyInstalled) {
        throw new Error('Product is already installed');
      }

      // Tạo purchase record nếu chưa có
      await this.createPurchase(userId, productId);
    } catch (error) {
      console.error('Error installing product:', error);
      throw error;
    }
  }

  /**
   * Gỡ cài đặt sản phẩm của user
   */
  static async uninstall(userId: number, productId: number): Promise<void> {
    try {
      await db.delete(userPurchases)
        .where(and(
          eq(userPurchases.userId, userId),
          eq(userPurchases.productId, productId)
        ));
    } catch (error) {
      console.error('Error uninstalling product:', error);
      throw error;
    }
  }

  /**
   * Thêm review cho sản phẩm
   */
  static async addReview(userId: number, productId: number, rating: number, comment?: string): Promise<any> {
    try {
      // Trong implementation thực tế, bạn sẽ có bảng reviews
      // Hiện tại trả về dữ liệu mặc định
      const review = {
        id: Date.now(),
        userId,
        productId,
        rating,
        comment: comment || '',
        createdAt: new Date()
      };

      return review;
    } catch (error) {
      console.error('Error adding product review:', error);
      throw error;
    }
  }
}

/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
export const StoreProductConverter = {
  /**
   * Convert từ Database format → API Response format
   */
  async toAPI(dbProduct: StoreProduct, userId?: number): Promise<any> {
    try {
      // Lấy thông tin category
      const category = dbProduct.categoryId 
        ? await StoreCategoryModel.findById(dbProduct.categoryId)
        : null;

      // Lấy rating info
      const ratingInfo = await StoreProductModel.getProductRating(dbProduct.id);

      // Kiểm tra đã cài đặt chưa
      const installed = userId 
        ? await StoreProductModel.isInstalledByUser(dbProduct.id, userId)
        : false;

      // Parse tags
      const tags = StoreProductModel.parseTags(dbProduct.tags);

      return {
        id: dbProduct.id.toString(),                    // integer → string
        name: dbProduct.name,
        description: dbProduct.description,
        price: dbProduct.price,
        category: category?.name || 'Uncategorized',    // computed field
        categoryId: dbProduct.categoryId?.toString(),   // integer → string
        image: dbProduct.imageUrl,                      // field name mapping
        rating: ratingInfo.rating,                      // computed field
        reviewCount: ratingInfo.reviewCount,            // computed field
        installed: installed,                           // computed field
        featured: dbProduct.featured || false,
        tags: tags,                                     // JSON string → array
        version: '1.0.0',                               // default value
        author: 'Store Admin',                          // default value
        lastUpdated: dbProduct.updatedAt.toISOString(), // timestamp → ISO string
        requirements: []                                // default empty array
      };
    } catch (error) {
      console.error('Error converting product to API format:', error);
      throw error;
    }
  },

  /**
   * Convert từ API Request → Database format
   */
  fromAPI(apiData: any): Partial<StoreProduct> {
    const result: any = {};
    
    if (apiData.id) result.id = parseInt(apiData.id);
    if (apiData.name) result.name = apiData.name;
    if (apiData.description) result.description = apiData.description;
    if (apiData.price !== undefined) result.price = apiData.price;
    if (apiData.categoryId) result.categoryId = parseInt(apiData.categoryId);
    if (apiData.image) result.imageUrl = apiData.image;
    if (apiData.featured !== undefined) result.featured = apiData.featured;
    if (apiData.tags) result.tags = JSON.stringify(apiData.tags);
    
    return result;
  }
};

/**
 * Import StoreCategoryModel để sử dụng trong converter
 */
import { StoreCategoryModel } from './StoreCategory';