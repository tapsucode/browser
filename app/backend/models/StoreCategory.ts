import { db } from '../db';
import { storeCategories, storeProducts } from '../schema';
import type { StoreCategory } from '../schema';
import { eq, sql, ne } from 'drizzle-orm';

export interface StoreCategoryCreateInput {
  name: string;
  description?: string;
}

export interface StoreCategoryUpdateInput {
  name?: string;
  description?: string;
}

export class StoreCategoryModel {
  static async findById(id: number): Promise<StoreCategory | null> {
    try {
      const result = await db.select().from(storeCategories).where(eq(storeCategories.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding category by ID:', error);
      return null;
    }
  }

  static async findAll(): Promise<StoreCategory[]> {
    try {
      return await db.select().from(storeCategories);
    } catch (error) {
      console.error('Error finding all categories:', error);
      return [];
    }
  }

  /**
   * Tạo category mới
   */
  static async create(categoryData: StoreCategoryCreateInput): Promise<StoreCategory | null> {
    try {
      const newCategory = {
        name: categoryData.name,
        description: categoryData.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(storeCategories).values(newCategory).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating store category:', error);
      return null;
    }
  }

  /**
   * Cập nhật category
   */
  static async update(id: number, categoryData: StoreCategoryUpdateInput): Promise<StoreCategory | null> {
    try {
      const updateData = {
        ...categoryData,
        updatedAt: new Date(),
      };

      const result = await db.update(storeCategories)
        .set(updateData)
        .where(eq(storeCategories.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating store category:', error);
      return null;
    }
  }

  /**
   * Xóa category
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(storeCategories).where(eq(storeCategories.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting store category:', error);
      return false;
    }
  }

    /**
   * Lấy categories với số lượng products
   */
  static async findWithProductCount(): Promise<(StoreCategory & { productCount: number })[]> {
    try {
      const result = await db.select({
        category: storeCategories,
        productCount: sql<number>`COALESCE(COUNT(${storeProducts.id}), 0)`,
      })
      .from(storeCategories)
      .leftJoin(storeProducts, eq(storeCategories.id, storeProducts.categoryId))
      .groupBy(storeCategories.id);

      return result.map(r => ({
        ...r.category,
        productCount: r.productCount,
      }));
    } catch (error) {
      console.error('Error finding categories with product count:', error);
      return [];
    }
  }

  /**
   * Lấy products trong category
   */
  static async getProducts(categoryId: number) {
    try {
      return await db.select()
        .from(storeProducts)
        .where(eq(storeProducts.categoryId, categoryId));
    } catch (error) {
      console.error('Error getting products in category:', error);
      return [];
    }
  }

  /**
   * Kiểm tra category có tồn tại không
   */
  static async exists(id: number): Promise<boolean> {
    try {
      const result = await db.select({ id: storeCategories.id })
        .from(storeCategories)
        .where(eq(storeCategories.id, id))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if store category exists:', error);
      return false;
    }
  }

  /**
   * Kiểm tra tên category có trùng không
   */
  static async existsByName(name: string, excludeId?: number): Promise<boolean> {
    try {
      const result = await db.select({ id: storeCategories.id })
        .from(storeCategories)
        .where(excludeId 
          ? sql`${storeCategories.name} = ${name} AND ${storeCategories.id} != ${excludeId}`
          : eq(storeCategories.name, name)
        )
        .limit(1);
        
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if store category name exists:', error);
      return false;
    }
  }
}

/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
export const StoreCategoryConverter = {
  /**
   * Convert từ Database format → API Response format
   */
  async toAPI(dbCategory: StoreCategory): Promise<any> {
    try {
      // Lấy số lượng products trong category
      const products = await db.select()
        .from(storeProducts)
        .where(eq(storeProducts.categoryId, dbCategory.id));
      
      const productCount = products.length;

      return {
        id: dbCategory.id.toString(),           // integer → string
        name: dbCategory.name,
        description: dbCategory.description || '',
        icon: 'folder',                         // default icon
        productCount: productCount              // computed field
      };
    } catch (error) {
      console.error('Error converting category to API format:', error);
      throw error;
    }
  },

  /**
   * Convert từ API Request → Database format
   */
  fromAPI(apiData: any): Partial<StoreCategory> {
    const result: any = {};
    
    if (apiData.id) result.id = parseInt(apiData.id);
    if (apiData.name) result.name = apiData.name;
    if (apiData.description) result.description = apiData.description;
    
    return result;
  }
};