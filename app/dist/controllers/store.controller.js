"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const store_service_1 = require("../services/store.service");
const StoreProduct_1 = require("../models/StoreProduct");
const StoreCategory_1 = require("../models/StoreCategory");
class StoreController {
    /**
     * Handle requests from main.js routing for /api/store/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(2).join('/');
            switch (method) {
                case 'GET':
                    if (path === '/products') {
                        // SỬA ĐỔI: Truyền cả data và user
                        return await this.handleGetProducts(data, authenticatedUser);
                    }
                    else if (path === '/products/search') {
                        // SỬA ĐỔI: Truyền cả data và user
                        return await this.handleSearchProducts(data, authenticatedUser);
                    }
                    else if (path === '/products/featured') {
                        // SỬA ĐỔI: Truyền user
                        return await this.handleGetFeaturedProducts(authenticatedUser);
                    }
                    else if (path === '/products/installed') {
                        // SỬA ĐỔI: Truyền user
                        return await this.handleGetInstalledProducts(authenticatedUser);
                    }
                    else if (path.match(/^\/products\/category\/\d+$/)) {
                        const categoryId = parseInt(path.split('/')[3]);
                        // SỬA ĐỔI: Truyền user
                        return await this.handleGetProductsByCategory(categoryId, authenticatedUser);
                    }
                    else if (path.match(/^\/products\/\d+$/)) {
                        const productId = parseInt(path.split('/')[2]);
                        // SỬA ĐỔI: Truyền user
                        return await this.handleGetProductDetails(productId, authenticatedUser);
                    }
                    else if (path.match(/^\/products\/\d+\/reviews$/)) {
                        const productId = parseInt(path.split('/')[2]);
                        // Không cần user, giữ nguyên
                        return await this.handleGetProductReviews(productId, data);
                    }
                    else if (path === '/categories') {
                        // Không cần user, giữ nguyên
                        return await this.handleGetCategories();
                    }
                    else if (path === '/tags') {
                        return await this.handleGetTags(data);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'POST':
                    if (path.match(/^\/products\/\d+\/purchase$/)) {
                        const productId = parseInt(path.split('/')[2]);
                        // SỬA ĐỔI: Truyền user
                        return await this.handlePurchaseProduct(productId, authenticatedUser);
                    }
                    else if (path.match(/^\/products\/\d+\/install$/)) {
                        const productId = parseInt(path.split('/')[2]);
                        // SỬA ĐỔI: Truyền user
                        return await this.handleInstallProduct(productId, authenticatedUser);
                    }
                    else if (path.match(/^\/products\/\d+\/uninstall$/)) {
                        const productId = parseInt(path.split('/')[2]);
                        // SỬA ĐỔI: Truyền user
                        return await this.handleUninstallProduct(productId, authenticatedUser);
                    }
                    else if (path.match(/^\/products\/\d+\/rate$/)) {
                        const productId = parseInt(path.split('/')[2]);
                        // SỬA ĐỔI: Truyền data và user
                        return await this.handleRateProduct(productId, data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('StoreController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleGetProducts(data, authenticatedUser) {
        try {
            const { categoryId, search, minPrice, maxPrice, installed, featured, tags, sortBy, sortDirection } = data || {};
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            // Use StoreService instead of direct model calls
            const products = await store_service_1.StoreService.getProducts({
                categoryId,
                search,
                minPrice,
                maxPrice,
                installed,
                featured,
                tags,
                sortBy,
                sortDirection
            });
            // Convert to API format
            const apiProducts = await Promise.all(products.map((product) => StoreProduct_1.StoreProductConverter.toAPI(product, userId)));
            return {
                success: true,
                products: apiProducts,
                total: apiProducts.length
            };
        }
        catch (error) {
            console.error('Error getting products:', error);
            throw new Error('Failed to fetch products');
        }
    }
    static async handleSearchProducts(data, authenticatedUser) {
        try {
            const { q: query } = data;
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!query) {
                throw new Error('Search query is required');
            }
            // Use StoreService with search filter
            const products = await store_service_1.StoreService.getProducts({ search: query });
            const apiProducts = await Promise.all(products.map((product) => StoreProduct_1.StoreProductConverter.toAPI(product, userId)));
            return {
                success: true,
                products: apiProducts,
                total: apiProducts.length,
                query
            };
        }
        catch (error) {
            console.error('Error searching products:', error);
            throw new Error(error instanceof Error ? error.message : 'Search failed');
        }
    }
    static async handleGetProductsByCategory(categoryId, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!categoryId || isNaN(categoryId)) {
                throw new Error('Invalid category ID');
            }
            // Use StoreService with category filter
            const products = await store_service_1.StoreService.getProducts({ categoryId });
            const apiProducts = await Promise.all(products.map((product) => StoreProduct_1.StoreProductConverter.toAPI(product, userId)));
            return {
                success: true,
                products: apiProducts,
                total: apiProducts.length,
                categoryId
            };
        }
        catch (error) {
            console.error('Error getting products by category:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
        }
    }
    static async handleGetFeaturedProducts(authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            // Use StoreService instead of direct model call
            const products = await store_service_1.StoreService.getFeaturedProducts();
            const apiProducts = await Promise.all(products.map((product) => StoreProduct_1.StoreProductConverter.toAPI(product, userId)));
            return {
                success: true,
                products: apiProducts,
                total: apiProducts.length
            };
        }
        catch (error) {
            console.error('Error getting featured products:', error);
            throw new Error('Failed to fetch featured products');
        }
    }
    static async handleGetProductDetails(productId, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!productId || isNaN(productId)) {
                throw new Error('Invalid product ID');
            }
            // Use StoreService instead of direct model call
            const product = await store_service_1.StoreService.getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            const apiProduct = await StoreProduct_1.StoreProductConverter.toAPI(product, userId);
            return {
                success: true,
                product: apiProduct
            };
        }
        catch (error) {
            console.error('Error getting product details:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch product details');
        }
    }
    static async handleGetProductReviews(productId, data) {
        try {
            if (!productId || isNaN(productId)) {
                throw new Error('Invalid product ID');
            }
            const reviews = await StoreProduct_1.StoreProductModel.getReviews(productId);
            return {
                success: true,
                reviews,
                total: reviews.length
            };
        }
        catch (error) {
            console.error('Error getting product reviews:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch reviews');
        }
    }
    static async handleGetCategories() {
        try {
            // Use StoreService instead of direct model call
            const categories = await store_service_1.StoreService.getCategories();
            const apiCategories = categories.map((category) => StoreCategory_1.StoreCategoryConverter.toAPI(category));
            return {
                success: true,
                categories: apiCategories,
                total: apiCategories.length
            };
        }
        catch (error) {
            console.error('Error getting categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }
    static async handleGetInstalledProducts(authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            // Get all products and filter by installed status
            const allProducts = await StoreProduct_1.StoreProductModel.findAll();
            const installedProducts = [];
            for (const product of allProducts) {
                const isInstalled = await StoreProduct_1.StoreProductModel.isInstalledByUser(product.id, userId);
                if (isInstalled) {
                    installedProducts.push(product);
                }
            }
            const apiProducts = await Promise.all(installedProducts.map((product) => StoreProduct_1.StoreProductConverter.toAPI(product, userId)));
            return {
                success: true,
                products: apiProducts,
                total: apiProducts.length
            };
        }
        catch (error) {
            console.error('Error getting installed products:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch installed products');
        }
    }
    static async handlePurchaseProduct(productId, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            if (!productId || isNaN(productId)) {
                throw new Error('Invalid product ID');
            }
            // Use StoreService for purchase logic with proper business rules
            const purchaseResult = await store_service_1.StoreService.purchaseProduct(userId, productId);
            return {
                success: true,
                message: 'Product purchased successfully',
                purchase: purchaseResult
            };
        }
        catch (error) {
            console.error('Error purchasing product:', error);
            throw new Error(error instanceof Error ? error.message : 'Purchase failed');
        }
    }
    static async handleInstallProduct(productId, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            if (!productId || isNaN(productId)) {
                throw new Error('Invalid product ID');
            }
            // Check if product exists
            const product = await StoreProduct_1.StoreProductModel.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            // Check if already installed
            const isInstalled = await StoreProduct_1.StoreProductModel.isInstalledByUser(productId, userId);
            if (isInstalled) {
                throw new Error('Product already installed');
            }
            // For now, we'll simulate installation
            // In a real implementation, this would handle actual software installation
            return {
                success: true,
                message: 'Product installed successfully'
            };
        }
        catch (error) {
            console.error('Error installing product:', error);
            throw new Error(error instanceof Error ? error.message : 'Installation failed');
        }
    }
    static async handleUninstallProduct(productId, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            if (!productId || isNaN(productId)) {
                throw new Error('Invalid product ID');
            }
            // Check if product exists
            const product = await StoreProduct_1.StoreProductModel.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            // Check if installed
            const isInstalled = await StoreProduct_1.StoreProductModel.isInstalledByUser(productId, userId);
            if (!isInstalled) {
                throw new Error('Product not installed');
            }
            // For now, we'll simulate uninstallation
            // In a real implementation, this would handle actual software removal
            return {
                success: true,
                message: 'Product uninstalled successfully'
            };
        }
        catch (error) {
            console.error('Error uninstalling product:', error);
            throw new Error(error instanceof Error ? error.message : 'Uninstallation failed');
        }
    }
    static async handleRateProduct(productId, data, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            if (!productId || isNaN(productId)) {
                throw new Error('Invalid product ID');
            }
            const { rating, review } = data;
            if (!rating || rating < 1 || rating > 5) {
                throw new Error('Invalid rating (must be 1-5)');
            }
            // Check if product exists
            const product = await StoreProduct_1.StoreProductModel.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            // For now, we'll simulate rating storage
            // In a real implementation, this would store in a reviews table
            const ratingResult = {
                id: Date.now(),
                productId,
                userId,
                rating,
                review: review || '',
                createdAt: new Date()
            };
            return {
                success: true,
                message: 'Product rated successfully',
                rating: ratingResult
            };
        }
        catch (error) {
            console.error('Error rating product:', error);
            throw new Error(error instanceof Error ? error.message : 'Rating failed');
        }
    }
    static async handleGetTags(data) {
        try {
            const tags = await store_service_1.StoreService.getTags();
            return {
                success: true,
                data: tags,
                total: tags.length
            };
        }
        catch (error) {
            console.error('Error getting tags:', error);
            throw new Error('Failed to fetch tags');
        }
    }
}
exports.StoreController = StoreController;
