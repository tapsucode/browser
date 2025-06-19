import { Product } from '../../types/store';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onInstall?: (productId: string) => void;
  onRate?: (productId: string, rating: number) => void;
}

const ProductGrid = ({ 
  products, 
  isLoading = false, 
  onInstall, 
  onRate 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
        <p className="mt-2 text-gray-500">Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          onInstall={onInstall ? () => onInstall(product.id) : undefined}
          onRate={onRate ? (rating: number) => onRate(product.id, rating) : undefined} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;