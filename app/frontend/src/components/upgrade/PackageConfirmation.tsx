import { SelectedPackage } from '../../types/upgrade';
import { formatCurrency, formatSubscriptionPeriod } from '../../utils/pricing';
import { Check, ChevronLeft } from 'lucide-react';

interface PackageConfirmationProps {
  selectedPackage: SelectedPackage;
  onConfirm: () => void;
  onBack: () => void;
}

const PackageConfirmation = ({
  selectedPackage,
  onConfirm,
  onBack,
}) => {
  const { package: pkg, period } = selectedPackage;
  const pricing = pkg.pricingOptions[period];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Xác Nhận Gói Của Bạn</h2>
      
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Thời hạn:</h4>
              <p className="text-lg font-medium">{formatSubscriptionPeriod(period)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Tính năng bao gồm:</h4>
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6 md:mt-0 md:ml-6 md:min-w-[250px]">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h4>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Gói:</span>
                <span className="font-medium">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời hạn:</span>
                <span className="font-medium">{formatSubscriptionPeriod(period)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thanh toán hàng tháng:</span>
                <span className="font-medium">{formatCurrency(pricing.monthlyPrice)}</span>
              </div>
              
              {period > 1 && pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Tiết kiệm:</span>
                  <span>-{pricing.discount}%</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-3 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(pricing.totalPrice)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {period > 1
                  ? `Thanh toán một lần cho ${period} tháng`
                  : 'Thanh toán hàng tháng'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <button
          onClick={onBack}
          className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Quay lại
        </button>
        
        <button
          onClick={onConfirm}
          className="py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  );
};

export default PackageConfirmation;