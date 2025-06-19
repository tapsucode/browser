import { useEffect, useState } from 'react';
import StoreHeader from '../components/store/StoreHeader';
import SearchBar from '../components/store/SearchBar';
import CategoryTabs from '../components/store/CategoryTabs';
import ProductGrid from '../components/store/ProductGrid';
import Pagination from '../components/store/Pagination';
import { useStore } from '../hooks/us/useStore';

export default function StorePage() {
  // Sử dụng hook để xử lý tất cả logic và trạng thái
  const {
    // State
    activeCategory,
    searchQuery,
    products,
    categories,
    
    // Loading states
    isLoadingProducts,
    isLoadingCategories,
    
    // Actions
    setActiveCategory, 
    setSearchQuery,
    installProduct,
    rateProduct
  } = useStore();
  
  // Phân trang (tự xử lý ở trang thay vì trong hook)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Tính toán sản phẩm phân trang
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset trang khi thay đổi danh mục hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader title="Chợ ứng dụng" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="relative">
            <SearchBar onSearch={setSearchQuery} value={searchQuery} />
          </div>
        </div>
        
        <CategoryTabs 
          categories={categories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory}
          isLoading={isLoadingCategories}
        />
        
        <ProductGrid 
          products={paginatedProducts}
          isLoading={isLoadingProducts}
          onInstall={installProduct}
          onRate={rateProduct} 
        />
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}