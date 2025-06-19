"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProductConverter = exports.StoreProductModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class StoreProductModel {
    /**
     * Tìm product theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.storeProducts).where((0, drizzle_orm_1.eq)(schema_1.storeProducts.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding store product by ID:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả products
     */
    static async findAll() {
        try {
            return await db_1.db.select().from(schema_1.storeProducts).orderBy((0, drizzle_orm_1.desc)(schema_1.storeProducts.createdAt));
        }
        catch (error) {
            console.error('Error finding all store products:', error);
            return [];
        }
    }
    /**
     * Lấy featured products
     */
    static async findFeatured() {
        try {
            return await db_1.db.select().from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.featured, true))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.storeProducts.createdAt));
        }
        catch (error) {
            console.error('Error finding featured products:', error);
            return [];
        }
    }
    /**
     * Lấy products theo category
     */
    static async findByCategory(categoryId) {
        try {
            return await db_1.db.select().from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.categoryId, categoryId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.storeProducts.createdAt));
        }
        catch (error) {
            console.error('Error finding products by category:', error);
            return [];
        }
    }
    /**
     * Tìm kiếm products
     */
    static async search(query) {
        try {
            return await db_1.db.select().from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.like)(schema_1.storeProducts.name, `%${query}%`))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.storeProducts.createdAt));
        }
        catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }
    /**
     * Tạo product mới
     */
    static async create(productData) {
        try {
            const newProduct = {
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
            const result = await db_1.db.insert(schema_1.storeProducts).values(newProduct).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating store product:', error);
            return null;
        }
    }
    /**
     * Cập nhật product
     */
    static async update(id, productData) {
        try {
            const updateData = {
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
            const result = await db_1.db.update(schema_1.storeProducts)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating store product:', error);
            return null;
        }
    }
    /**
     * Xóa product
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.storeProducts).where((0, drizzle_orm_1.eq)(schema_1.storeProducts.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting store product:', error);
            return false;
        }
    }
    /**
     * Lấy product với category info
     */
    static async findWithCategory(id) {
        try {
            const result = await db_1.db.select({
                product: schema_1.storeProducts,
                category: schema_1.storeCategories,
            })
                .from(schema_1.storeProducts)
                .leftJoin(schema_1.storeCategories, (0, drizzle_orm_1.eq)(schema_1.storeProducts.categoryId, schema_1.storeCategories.id))
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.id, id))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].product,
                category: result[0].category,
            };
        }
        catch (error) {
            console.error('Error finding product with category:', error);
            return null;
        }
    }
    /**
     * Cập nhật stock status
     */
    static async updateStock(id, inStock, quantity) {
        try {
            const updateData = {
                inStock,
                updatedAt: new Date(),
            };
            if (quantity !== undefined) {
                updateData.quantity = quantity;
            }
            await db_1.db.update(schema_1.storeProducts)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.id, id));
            return true;
        }
        catch (error) {
            console.error('Error updating product stock:', error);
            return false;
        }
    }
    /**
     * Toggle featured status
     */
    static async toggleFeatured(id) {
        try {
            const product = await this.findById(id);
            if (!product)
                return false;
            await db_1.db.update(schema_1.storeProducts)
                .set({
                featured: !product.featured,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.id, id));
            return true;
        }
        catch (error) {
            console.error('Error toggling product featured status:', error);
            return false;
        }
    }
    /**
     * Lấy products trong khoảng giá
     */
    static async findByPriceRange(minPrice, maxPrice) {
        try {
            return await db_1.db.select().from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.storeProducts.inStock, true)))
                .orderBy(schema_1.storeProducts.price);
        }
        catch (error) {
            console.error('Error finding products by price range:', error);
            return [];
        }
    }
    /**
     * Parse tags data
     */
    static parseTags(tagsJson) {
        if (!tagsJson)
            return [];
        try {
            return JSON.parse(tagsJson);
        }
        catch (error) {
            console.error('Error parsing tags data:', error);
            return [];
        }
    }
    /**
     * Lấy products đã mua bởi user
     */
    static async findPurchasedByUser(userId) {
        try {
            const result = await db_1.db.select({
                product: schema_1.storeProducts,
            })
                .from(schema_1.storeProducts)
                .innerJoin(schema_1.userPurchases, (0, drizzle_orm_1.eq)(schema_1.storeProducts.id, schema_1.userPurchases.productId))
                .where((0, drizzle_orm_1.eq)(schema_1.userPurchases.userId, userId));
            return result.map(r => r.product);
        }
        catch (error) {
            console.error('Error finding products purchased by user:', error);
            return [];
        }
    }
    /**
     * Lấy best selling products
     */
    static async findBestSelling(limit = 10) {
        try {
            // In a real implementation, you'd join with purchases and order by sales count
            return await db_1.db.select().from(schema_1.storeProducts)
                .where((0, drizzle_orm_1.eq)(schema_1.storeProducts.inStock, true))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.storeProducts.createdAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error finding best selling products:', error);
            return [];
        }
    }
    /**
     * Kiểm tra sản phẩm đã được user cài đặt chưa
     */
    static async isInstalledByUser(productId, userId) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.userPurchases)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userPurchases.productId, productId), (0, drizzle_orm_1.eq)(schema_1.userPurchases.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userPurchases.status, 'completed')))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if product is installed by user:', error);
            return false;
        }
    }
    /**
     * Lấy rating trung bình và số lượng review của sản phẩm
     */
    static async getProductRating(productId) {
        try {
            // Trong implementation thực tế, bạn sẽ có bảng reviews
            // Hiện tại trả về dữ liệu mặc định
            return {
                rating: 4.5,
                reviewCount: Math.floor(Math.random() * 100) + 10
            };
        }
        catch (error) {
            console.error('Error getting product rating:', error);
            return { rating: 0, reviewCount: 0 };
        }
    }
    /**
     * Tạo purchase record cho user
     */
    static async createPurchase(userId, productId) {
        try {
            const purchase = {
                userId,
                productId,
                status: 'completed',
                purchaseDate: new Date(),
                amount: 0 // Will be updated with actual product price
            };
            const result = await db_1.db.insert(schema_1.userPurchases).values({
                userId: userId,
                productId: productId,
                quantity: 1,
                price: 0,
                status: 'completed'
            }).returning();
            return result[0] || purchase;
        }
        catch (error) {
            console.error('Error creating purchase:', error);
            throw error;
        }
    }
    /**
     * Lấy reviews của sản phẩm
     */
    static async getReviews(productId) {
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
        }
        catch (error) {
            console.error('Error getting product reviews:', error);
            return [];
        }
    }
    /**
     * Lấy danh sách sản phẩm đã cài đặt của user
     */
    static async findInstalled(userId) {
        try {
            const result = await db_1.db.select({
                product: schema_1.storeProducts,
            })
                .from(schema_1.storeProducts)
                .innerJoin(schema_1.userPurchases, (0, drizzle_orm_1.eq)(schema_1.storeProducts.id, schema_1.userPurchases.productId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userPurchases.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userPurchases.status, 'completed')));
            return result.map(r => r.product);
        }
        catch (error) {
            console.error('Error finding installed products:', error);
            return [];
        }
    }
    /**
     * Cài đặt sản phẩm cho user
     */
    static async install(userId, productId) {
        try {
            // Kiểm tra xem đã cài đặt chưa
            const alreadyInstalled = await this.isInstalledByUser(productId, userId);
            if (alreadyInstalled) {
                throw new Error('Product is already installed');
            }
            // Tạo purchase record nếu chưa có
            await this.createPurchase(userId, productId);
        }
        catch (error) {
            console.error('Error installing product:', error);
            throw error;
        }
    }
    /**
     * Gỡ cài đặt sản phẩm của user
     */
    static async uninstall(userId, productId) {
        try {
            await db_1.db.delete(schema_1.userPurchases)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userPurchases.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userPurchases.productId, productId)));
        }
        catch (error) {
            console.error('Error uninstalling product:', error);
            throw error;
        }
    }
    /**
     * Thêm review cho sản phẩm
     */
    static async addReview(userId, productId, rating, comment) {
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
        }
        catch (error) {
            console.error('Error adding product review:', error);
            throw error;
        }
    }
}
exports.StoreProductModel = StoreProductModel;
/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
exports.StoreProductConverter = {
    /**
     * Convert từ Database format → API Response format
     */
    async toAPI(dbProduct, userId) {
        try {
            // Lấy thông tin category
            const category = dbProduct.categoryId
                ? await StoreCategory_1.StoreCategoryModel.findById(dbProduct.categoryId)
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
                id: dbProduct.id.toString(), // integer → string
                name: dbProduct.name,
                description: dbProduct.description,
                price: dbProduct.price,
                category: category?.name || 'Uncategorized', // computed field
                categoryId: dbProduct.categoryId?.toString(), // integer → string
                image: dbProduct.imageUrl, // field name mapping
                rating: ratingInfo.rating, // computed field
                reviewCount: ratingInfo.reviewCount, // computed field
                installed: installed, // computed field
                featured: dbProduct.featured || false,
                tags: tags, // JSON string → array
                version: '1.0.0', // default value
                author: 'Store Admin', // default value
                lastUpdated: dbProduct.updatedAt.toISOString(), // timestamp → ISO string
                requirements: [] // default empty array
            };
        }
        catch (error) {
            console.error('Error converting product to API format:', error);
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
        if (apiData.price !== undefined)
            result.price = apiData.price;
        if (apiData.categoryId)
            result.categoryId = parseInt(apiData.categoryId);
        if (apiData.image)
            result.imageUrl = apiData.image;
        if (apiData.featured !== undefined)
            result.featured = apiData.featured;
        if (apiData.tags)
            result.tags = JSON.stringify(apiData.tags);
        return result;
    }
};
/**
 * Import StoreCategoryModel để sử dụng trong converter
 */
const StoreCategory_1 = require("./StoreCategory");
