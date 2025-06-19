"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCategoryConverter = exports.StoreCategoryModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class StoreCategoryModel {
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.storeCategories).where((0, drizzle_orm_1.eq)(schema_1.storeCategories.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding category by ID:', error);
            return null;
        }
    }
    static async findAll() {
        try {
            return await db_1.db.select().from(schema_1.storeCategories);
        }
        catch (error) {
            console.error('Error finding all categories:', error);
            return [];
        }
    }
    /**
     * Tạo category mới
     */
    static async create(categoryData) {
        try {
            const newCategory = {
                name: categoryData.name,
                description: categoryData.description || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = await db_1.db.insert(schema_1.storeCategories).values(newCategory).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating store category:', error);
            return null;
        }
    }
    /**
     * Cập nhật category
     */
    static async update(id, categoryData) {
        try {
            const updateData = {
                ...categoryData,
                updatedAt: new Date(),
            };
            const result = await db_1.db.update(schema_1.storeCategories)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.storeCategories.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating store category:', error);
            return null;
        }
    }
    /**
     * Xóa category
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.storeCategories).where((0, drizzle_orm_1.eq)(schema_1.storeCategories.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting store category:', error);
            return false;
        }
    }
    /**
   * Lấy categories với số lượng products
   */
    static async findWithProductCount() {
        try {
            const result = await db_1.db.select({
                category: schema_1.storeCategories,
                productCount: (0, drizzle_orm_1.sql) `COALESCE(COUNT(${schema_1.storeProducts.id}), 0)`,
            })
                .from(schema_1.storeCategories)
                .leftJoin(schema_1.storeProducts, (0, drizzle_orm_1.eq)(schema_1.storeCategories.id, schema_1.storeProducts.categoryId))
                .groupBy(schema_1.storeCategories.id);
            return result.map(r => ({
                ...r.category,
                productCount: r.productCount,
            }));
        }
        catch (error) {
            console.error('Error finding categories with product count:', error);
            return [];
        }
    }
    /**
     * Lấy products trong category
     */
    static async getProducts(categoryId) {
        try {
            return await db_1.db.select()
                .from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.categoryId, categoryId));
        }
        catch (error) {
            console.error('Error getting products in category:', error);
            return [];
        }
    }
    /**
     * Kiểm tra category có tồn tại không
     */
    static async exists(id) {
        try {
            const result = await db_1.db.select({ id: schema_1.storeCategories.id })
                .from(schema_1.storeCategories)
                .where((0, drizzle_orm_1.eq)(schema_1.storeCategories.id, id))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if store category exists:', error);
            return false;
        }
    }
    /**
     * Kiểm tra tên category có trùng không
     */
    static async existsByName(name, excludeId) {
        try {
            const result = await db_1.db.select({ id: schema_1.storeCategories.id })
                .from(schema_1.storeCategories)
                .where(excludeId
                ? (0, drizzle_orm_1.sql) `${schema_1.storeCategories.name} = ${name} AND ${schema_1.storeCategories.id} != ${excludeId}`
                : (0, drizzle_orm_1.eq)(schema_1.storeCategories.name, name))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if store category name exists:', error);
            return false;
        }
    }
}
exports.StoreCategoryModel = StoreCategoryModel;
/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
exports.StoreCategoryConverter = {
    /**
     * Convert từ Database format → API Response format
     */
    async toAPI(dbCategory) {
        try {
            // Lấy số lượng products trong category
            const products = await db_1.db.select()
                .from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.categoryId, dbCategory.id));
            const productCount = products.length;
            return {
                id: dbCategory.id.toString(), // integer → string
                name: dbCategory.name,
                description: dbCategory.description || '',
                icon: 'folder', // default icon
                productCount: productCount // computed field
            };
        }
        catch (error) {
            console.error('Error converting category to API format:', error);
            throw error;
        }
    },
    /**
     * Convert từ API Request → Database format
     */
    fromAPI(apiData) {
        const result = {};
        if (apiData.id)
            result.id = parseInt(apiData.id);
        if (apiData.name)
            result.name = apiData.name;
        if (apiData.description)
            result.description = apiData.description;
        return result;
    }
};
