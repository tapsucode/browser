import { StoreService } from '../services/store.service';
import { StoreProductModel, StoreProductConverter } from '../models/StoreProduct';
import { StoreCategoryModel, StoreCategoryConverter } from '../models/StoreCategory';
import { type AuthenticatedUser } from '../middleware/auth.middleware';

export class StoreController {
  /**
   * Handle requests from main.js routing for /api/store/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/');
      
      switch (method) {
        case 'GET':
          if (path === '/products') {
            // SỬA ĐỔI: Truyền cả data và user
            return await this.handleGetProducts(data, authenticatedUser);
          } else if (path === '/products/search') {
            // SỬA ĐỔI: Truyền cả data và user
            return await this.handleSearchProducts(data, authenticatedUser);
          } else if (path === '/products/featured') {
            // SỬA ĐỔI: Truyền user
            return await this.handleGetFeaturedProducts(authenticatedUser);
          } else if (path === '/products/installed') {
            // SỬA ĐỔI: Truyền user
            return await this.handleGetInstalledProducts(authenticatedUser);
          } else if (path.match(/^\/products\/category\/\d+$/)) {
            const categoryId = parseInt(path.split('/')[3]);
            // SỬA ĐỔI: Truyền user
            return await this.handleGetProductsByCategory(categoryId, authenticatedUser);
          } else if (path.match(/^\/products\/\d+$/)) {
            const productId = parseInt(path.split('/')[2]);
            // SỬA ĐỔI: Truyền user
            return await this.handleGetProductDetails(productId, authenticatedUser);
          } else if (path.match(/^\/products\/\d+\/reviews$/)) {
            const productId = parseInt(path.split('/')[2]);
            // Không cần user, giữ nguyên
            return await this.handleGetProductReviews(productId, data);
          } else if (path === '/categories') {
            // Không cần user, giữ nguyên
            return await this.handleGetCategories();
          } else if (path === '/tags') {
            return await this.handleGetTags(data);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path.match(/^\/products\/\d+\/purchase$/)) {
            const productId = parseInt(path.split('/')[2]);
            // SỬA ĐỔI: Truyền user
            return await this.handlePurchaseProduct(productId, authenticatedUser);
          } else if (path.match(/^\/products\/\d+\/install$/)) {
            const productId = parseInt(path.split('/')[2]);
            // SỬA ĐỔI: Truyền user
            return await this.handleInstallProduct(productId, authenticatedUser);
          } else if (path.match(/^\/products\/\d+\/uninstall$/)) {
            const productId = parseInt(path.split('/')[2]);
            // SỬA ĐỔI: Truyền user
            return await this.handleUninstallProduct(productId, authenticatedUser);
          } else if (path.match(/^\/products\/\d+\/rate$/)) {
            const productId = parseInt(path.split('/')[2]);
            // SỬA ĐỔI: Truyền data và user
            return await this.handleRateProduct(productId, data, authenticatedUser);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('StoreController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleGetProducts(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const { categoryId, search, minPrice, maxPrice, installed, featured, tags, sortBy, sortDirection } = data || {};
      
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      
      // Use StoreService instead of direct model calls
      const products = await StoreService.getProducts({
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
      const apiProducts = await Promise.all(
        products.map((product: any) => StoreProductConverter.toAPI(product, userId))
      );

      return {
        success: true,
        products: apiProducts,
        total: apiProducts.length
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  private static async handleSearchProducts(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const { q: query } = data;
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      
      if (!query) {
        throw new Error('Search query is required');
      }

      // Use StoreService with search filter
      const products = await StoreService.getProducts({ search: query });
      const apiProducts = await Promise.all(
        products.map((product: any) => StoreProductConverter.toAPI(product, userId))
      );

      return {
        success: true,
        products: apiProducts,
        total: apiProducts.length,
        query
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error(error instanceof Error ? error.message : 'Search failed');
    }
  }

  private static async handleGetProductsByCategory(categoryId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      
      if (!categoryId || isNaN(categoryId)) {
        throw new Error('Invalid category ID');
      }

      // Use StoreService with category filter
      const products = await StoreService.getProducts({ categoryId });
      const apiProducts = await Promise.all(
        products.map((product: any) => StoreProductConverter.toAPI(product, userId))
      );

      return {
        success: true,
        products: apiProducts,
        total: apiProducts.length,
        categoryId
      };
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }

  private static async handleGetFeaturedProducts(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      
      // Use StoreService instead of direct model call
      const products = await StoreService.getFeaturedProducts();
      const apiProducts = await Promise.all(
        products.map((product: any) => StoreProductConverter.toAPI(product, userId))
      );

      return {
        success: true,
        products: apiProducts,
        total: apiProducts.length
      };
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  private static async handleGetProductDetails(productId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      
      if (!productId || isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      // Use StoreService instead of direct model call
      const product = await StoreService.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const apiProduct = await StoreProductConverter.toAPI(product, userId);
      return {
        success: true,
        product: apiProduct
      };
    } catch (error) {
      console.error('Error getting product details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch product details');
    }
  }

  private static async handleGetProductReviews(productId: number, data: any): Promise<any> {
    try {
      if (!productId || isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      const reviews = await StoreProductModel.getReviews(productId);
      return {
        success: true,
        reviews,
        total: reviews.length
      };
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch reviews');
    }
  }

  private static async handleGetCategories(): Promise<any> {
    try {
      // Use StoreService instead of direct model call
      const categories = await StoreService.getCategories();
      const apiCategories = categories.map((category: any) => StoreCategoryConverter.toAPI(category));

      return {
        success: true,
        categories: apiCategories,
        total: apiCategories.length
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  private static async handleGetInstalledProducts(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get all products and filter by installed status
      const allProducts = await StoreProductModel.findAll();
      const installedProducts = [];
      
      for (const product of allProducts) {
        const isInstalled = await StoreProductModel.isInstalledByUser(product.id, userId);
        if (isInstalled) {
          installedProducts.push(product);
        }
      }

      const apiProducts = await Promise.all(
        installedProducts.map((product: any) => StoreProductConverter.toAPI(product, userId))
      );

      return {
        success: true,
        products: apiProducts,
        total: apiProducts.length
      };
    } catch (error) {
      console.error('Error getting installed products:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch installed products');
    }
  }

  private static async handlePurchaseProduct(productId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!productId || isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      // Use StoreService for purchase logic with proper business rules
      const purchaseResult = await StoreService.purchaseProduct(userId, productId);
      
      return {
        success: true,
        message: 'Product purchased successfully',
        purchase: purchaseResult
      };
    } catch (error) {
      console.error('Error purchasing product:', error);
      throw new Error(error instanceof Error ? error.message : 'Purchase failed');
    }
  }

  private static async handleInstallProduct(productId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!productId || isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      // Check if product exists
      const product = await StoreProductModel.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if already installed
      const isInstalled = await StoreProductModel.isInstalledByUser(productId, userId);
      if (isInstalled) {
        throw new Error('Product already installed');
      }

      // For now, we'll simulate installation
      // In a real implementation, this would handle actual software installation
      return {
        success: true,
        message: 'Product installed successfully'
      };
    } catch (error) {
      console.error('Error installing product:', error);
      throw new Error(error instanceof Error ? error.message : 'Installation failed');
    }
  }

  private static async handleUninstallProduct(productId: number,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!productId || isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      // Check if product exists
      const product = await StoreProductModel.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if installed
      const isInstalled = await StoreProductModel.isInstalledByUser(productId, userId);
      if (!isInstalled) {
        throw new Error('Product not installed');
      }

      // For now, we'll simulate uninstallation
      // In a real implementation, this would handle actual software removal
      return {
        success: true,
        message: 'Product uninstalled successfully'
      };
    } catch (error) {
      console.error('Error uninstalling product:', error);
      throw new Error(error instanceof Error ? error.message : 'Uninstallation failed');
    }
  }

  private static async handleRateProduct(productId: number, data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
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
      const product = await StoreProductModel.findById(productId);
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
    } catch (error) {
      console.error('Error rating product:', error);
      throw new Error(error instanceof Error ? error.message : 'Rating failed');
    }
  }

  private static async handleGetTags(data: any): Promise<any> {
  try {
    const tags = await StoreService.getTags();
    
    return {
      success: true,
      data: tags,
      total: tags.length
    };
  } catch (error) {
    console.error('Error getting tags:', error);
    throw new Error('Failed to fetch tags');
  }
}
}