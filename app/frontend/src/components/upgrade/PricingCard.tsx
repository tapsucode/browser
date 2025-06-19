import React from 'react';
import { Package, SubscriptionPeriod } from '../../types/upgrade';
import { formatCurrency } from '../../utils/pricing';
import { Check, Users } from 'lucide-react';

interface PricingCardProps {
  package: Package;
  period: SubscriptionPeriod;
  onSelect: () => void;
  onMemberCountChange?: (count: number) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  package: pkg,
  period,
  onSelect,
  onMemberCountChange,
}) => {
  const pricing = pkg.pricingOptions[period];
  const isPopular = pkg.tier === 'advanced';
  const isCloud = pkg.type === 'cloud';
  
  const getTierStyle = () => {
    switch (pkg.tier) {
      case 'basic':
        return {
          bgGradient: 'from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
          headerBg: 'bg-blue-500',
        };
      case 'advanced':
        return {
          bgGradient: 'from-purple-50 to-purple-100',
          borderColor: 'border-purple-200',
          buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
          headerBg: 'bg-purple-500',
        };
      case 'premium':
        return {
          bgGradient: 'from-teal-50 to-teal-100',
          borderColor: 'border-teal-200',
          buttonColor: 'bg-teal-600 hover:bg-teal-700 text-white',
          headerBg: 'bg-teal-500',
        };
      case 'enterprise':
        return {
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          buttonColor: 'bg-gray-700 hover:bg-gray-800 text-white',
          headerBg: 'bg-gray-600',
        };
      default:
        return {
          bgGradient: 'from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
          headerBg: 'bg-blue-500',
        };
    }
  };
  
  const tierStyle = getTierStyle();

  return (
    <div 
      className={`flex flex-col h-full rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${tierStyle.borderColor} ${
        isPopular ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-3 rounded-full transform rotate-12">
          Phổ biến nhất
        </div>
      )}
      
      <div className={`p-4 text-white ${tierStyle.headerBg}`}>
        <h3 className="text-base font-bold">{pkg.name}</h3>
        <p className="text-xs opacity-80">{pkg.recommendedFor}</p>
      </div>
      
      <div className={`flex-1 flex flex-col p-6 bg-gradient-to-b ${tierStyle.bgGradient}`}>
        <div className="mb-4">
          <div className="flex items-end">
            <span className="text-3xl font-bold">{formatCurrency(pricing.monthlyPrice)}</span>
            <span className="text-gray-600 ml-1 text-sm">/tháng</span>
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            {period > 1 && (
              <div className="flex items-center">
                <p>
                  <span className="line-through">{formatCurrency(pkg.pricingOptions[1].monthlyPrice * period)}</span>
                  {' '}{formatCurrency(pricing.totalPrice)} cho {period} tháng
                </p>
                {pricing.discount > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                    -{pricing.discount}%
                  </span>
                )}
              </div>
            )}
            {period === 1 && (
              <p>Thanh toán {formatCurrency(pricing.totalPrice)}</p>
            )}
          </div>
        </div>

        {isCloud && (
          <div className="mb-6 border-t border-b border-gray-200 py-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Số lượng thành viên
              </label>
              <span className="text-sm font-bold">{pkg.maxMembers}</span>
            </div>
            <input
              type="range"
              min={pkg.minMembers}
              max={pkg.maxMembers}
              defaultValue={pkg.defaultMembers}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => onMemberCountChange?.(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{pkg.minMembers}</span>
              <span>{pkg.maxMembers}</span>
            </div>
          </div>
        )}
        
        <div className="flex-1 space-y-3 mb-6">
          {pkg.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <button
          onClick={onSelect}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 ${tierStyle.buttonColor}`}
        >
          Chọn Gói
        </button>
      </div>
    </div>
  );
};

export default PricingCard;