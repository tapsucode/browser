import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Display only 5 pages at a time with ellipsis
  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    
    if (currentPage <= 4) {
      return [...pages.slice(0, 5), '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      return [1, '...', ...pages.slice(totalPages - 5)];
    } else {
      return [
        1, 
        '...', 
        currentPage - 1, 
        currentPage, 
        currentPage + 1, 
        '...', 
        totalPages
      ];
    }
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center items-center mt-8 mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="mr-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex space-x-2">
        {visiblePages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              className={cn(
                "min-w-[40px]",
                currentPage === page ? "bg-blue-600" : "bg-white"
              )}
              onClick={() => typeof page === 'number' && onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="ml-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;