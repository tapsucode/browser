import { ElectronAPIClient } from '../electron-api';
import { handleArrayResponse } from '../../utils/error-utils';

/**
 * Service xử lý các chức năng liên quan đến cửa hàng
 * Được sử dụng trong các pages:
 * - StorePage
 * - Các component liên quan đến việc hiển thị/mua bán sản phẩm
 */

// Định nghĩa các kiểu dữ liệu
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  image: string;
  rating: number;
  reviewCount: number;
  installed: boolean;
  featured?: boolean;
  tags?: string[];
  version?: string;
  author?: string;
  lastUpdated?: string;
  requirements?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  installed?: boolean;
  featured?: boolean;
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortDirection?: 'asc' | 'desc';
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const StoreFunctionalService = {
  /**
   * Lấy tất cả sản phẩm trong cửa hàng
   * @param {ProductFilters} filters Bộ lọc sản phẩm (tùy chọn)
   * @returns {Promise<Product[]>} Danh sách sản phẩm
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    // Tạo query params từ filters
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.installed !== undefined) queryParams.append('installed', filters.installed.toString());
      if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());
      if (filters.tags && filters.tags.length > 0) queryParams.append('tags', filters.tags.join(','));
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);
    }
    
    const url = `/api/store/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return handleArrayResponse<Product>(
      ElectronAPIClient.request('GET', url),
      'StoreFunctionalService',
      'getProducts'
    );
  },

  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} categoryId ID của danh mục
   * @returns {Promise<Product[]>} Danh sách sản phẩm
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await ElectronAPIClient.request('GET', `/api/store/products/category/${categoryId}`);
    return response.json();
  },

  /**
   * Tìm kiếm sản phẩm
   * @param {string} query Từ khóa tìm kiếm
   * @returns {Promise<Product[]>} Kết quả tìm kiếm
   */
  async searchProducts(query: string): Promise<Product[]> {
    const response = await ElectronAPIClient.request('GET', `/api/store/products/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string} productId ID của sản phẩm
   * @returns {Promise<Product>} Chi tiết sản phẩm
   */
  async getProductDetails(productId: string): Promise<Product> {
    const response = await ElectronAPIClient.request('GET', `/api/store/products/${productId}`);
    return response.json();
  },

  /**
   * Lấy tất cả danh mục
   * @returns {Promise<Category[]>} Danh sách danh mục
   */
  async getCategories(): Promise<Category[]> {
    return handleArrayResponse<Category>(
      ElectronAPIClient.request('GET', '/api/store/categories'),
      'StoreFunctionalService',
      'getCategories'
    );
  },

  /**
   * Cài đặt một sản phẩm
   * @param {string} productId ID của sản phẩm
   * @returns {Promise<{success: boolean, message: string}>} Kết quả cài đặt
   */
  async installProduct(productId: string): Promise<{success: boolean, message: string}> {
    const response = await ElectronAPIClient.request('POST', `/api/store/products/${productId}/install`);
    return response.json();
  },

  /**
   * Gỡ cài đặt một sản phẩm
   * @param {string} productId ID của sản phẩm
   * @returns {Promise<{success: boolean, message: string}>} Kết quả gỡ cài đặt
   */
  async uninstallProduct(productId: string): Promise<{success: boolean, message: string}> {
    const response = await ElectronAPIClient.request('POST', `/api/store/products/${productId}/uninstall`);
    return response.json();
  },

  /**
   * Đánh giá một sản phẩm
   * @param {string} productId ID của sản phẩm
   * @param {number} rating Đánh giá (1-5)
   * @param {string} comment Bình luận kèm theo đánh giá
   * @returns {Promise<{success: boolean, review?: Review}>} Kết quả đánh giá
   */
  async rateProduct(productId: string, rating: number, comment?: string): Promise<{success: boolean, review?: Review}> {
    const response = await ElectronAPIClient.request('POST', `/api/store/products/${productId}/rate`, { rating, comment });
    return response.json();
  },

  /**
   * Lấy đánh giá của một sản phẩm
   * @param {string} productId ID của sản phẩm
   * @returns {Promise<Review[]>} Danh sách đánh giá
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    const response = await ElectronAPIClient.request('GET', `/api/store/products/${productId}/reviews`);
    return response.json();
  },

  /**
   * Mua một sản phẩm
   * @param {string} productId ID của sản phẩm
   * @returns {Promise<{success: boolean, message: string, transactionId?: string}>} Kết quả mua
   */
  async purchaseProduct(productId: string): Promise<{success: boolean, message: string, transactionId?: string}> {
    const response = await ElectronAPIClient.request('POST', `/api/store/products/${productId}/purchase`);
    return response.json();
  },

  /**
   * Lấy sản phẩm đã cài đặt
   * @returns {Promise<Product[]>} Danh sách sản phẩm đã cài đặt
   */
  async getInstalledProducts(): Promise<Product[]> {
    return handleArrayResponse<Product>(
      ElectronAPIClient.request('GET', '/api/store/products/installed'),
      'StoreFunctionalService',
      'getInstalledProducts'
    );
  },

  /**
   * Lấy sản phẩm nổi bật
   * @returns {Promise<Product[]>} Danh sách sản phẩm nổi bật
   */
  async getFeaturedProducts(): Promise<Product[]> {
    return handleArrayResponse<Product>(
      ElectronAPIClient.request('GET', '/api/store/products/featured'),
      'StoreFunctionalService',
      'getFeaturedProducts'
    );
  },

  /**
   * Lấy danh sách tags
   * @returns {Promise<{id: string, name: string, count: number}[]>} Danh sách tags
   */
  async getTags(): Promise<{id: string, name: string, count: number}[]> {
    return handleArrayResponse<{id: string, name: string, count: number}>(
      ElectronAPIClient.request('GET', '/api/store/tags'),
      'StoreFunctionalService',
      'getTags'
    );
  }
};