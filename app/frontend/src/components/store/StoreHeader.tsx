import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StoreHeaderProps {
  title: string;
}

const StoreHeader = ({ title }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8 items-center">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <Button 
            variant="default" 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Đăng ký bán hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;