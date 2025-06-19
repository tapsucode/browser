import { Product } from '../../types/store';
import StarRating from './StarRating';
import { Tag, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onInstall?: () => void;
  onRate?: (rating: number) => void;
}

const ProductCard = ({ 
  product, 
  onInstall, 
  onRate 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRating, setIsRating] = useState(false);
  
  const handleInstall = () => {
    if (onInstall) {
      onInstall();
    }
  };
  
  const handleRate = (rating: number) => {
    if (onRate) {
      onRate(rating);
      setIsRating(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsRating(false);
      }}
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover object-center"
        />
        {product.isMobile && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
            Mobile
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          {isRating ? (
            <div className="flex items-center">
              <StarRating rating={0} onRate={handleRate} interactive />
              <button 
                className="text-xs text-gray-500 ml-2"
                onClick={() => setIsRating(false)}
              >
                Hủy
              </button>
            </div>
          ) : (
            <>
              <StarRating 
                rating={product.rating} 
                onClick={() => setIsRating(true)}
              />
              <span className="text-xs text-gray-600 ml-2">
                ({product.views} Views)
              </span>
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">{product.price}</span>
          
          {isHovered && onInstall && (
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleInstall}
            >
              <Download className="h-4 w-4 mr-1" />
              Cài đặt
            </Button>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <Tag className="w-4 h-4 mr-1" />
          <span>Cung cấp bởi: </span>
          <span className="ml-1 text-blue-600">{product.provider}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;