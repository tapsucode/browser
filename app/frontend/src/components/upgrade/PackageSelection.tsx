import { useState, useEffect } from 'react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import { SelectedPackage, Package, PackageType, SubscriptionPeriod } from '../../types/upgrade';
import { getAllPackages, getPackagesByType, formatCurrency } from '../../utils/pricing';
import { CheckCircle, Users, Clock } from 'lucide-react';

interface PackageSelectionProps {
  onSelectPackage: (pkg: SelectedPackage) => void;
}

export default function PackageSelection({ onSelectPackage }) {
  const [packageType, setPackageType] = useState<PackageType>('cloud');
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(1);
  
  // Load packages on component mount and when package type changes
  useEffect(() => {
    const filteredPackages = getPackagesByType(packageType);
    setPackages(filteredPackages);
  }, [packageType]);
  
  const handleTypeChange = (type: PackageType) => {
    setPackageType(type);
  };
  
  const handlePackageSelect = (pkg: Package) => {
    const selectedPackage: SelectedPackage = {
      package: pkg,
      period: selectedPeriod,
      memberCount: pkg.defaultMembers,
    };
    onSelectPackage(selectedPackage);
  };
  
  const periodOptions: {value: SubscriptionPeriod, label: string}[] = [
    { value: 1, label: 'Hàng tháng' },
    { value: 6, label: '6 tháng' },
    { value: 12, label: '12 tháng' }
  ];
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn Gói Bảo Vệ</h2>
      
      <div className="mb-8">
        <TabGroup onChange={(index) => {
          const types: PackageType[] = ['cloud', 'local', 'custom'];
          handleTypeChange(types[index]);
        }}>
          <TabList className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
            <Tab className={({ selected }) => 
              `py-2.5 px-5 text-sm leading-5 font-medium rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60 ${
                selected 
                  ? 'bg-white shadow' 
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }`
            }>
              Cloud
            </Tab>
            <Tab className={({ selected }) => 
              `py-2.5 px-5 text-sm leading-5 font-medium rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60 ${
                selected 
                  ? 'bg-white shadow' 
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }`
            }>
              Local
            </Tab>
            <Tab className={({ selected }) => 
              `py-2.5 px-5 text-sm leading-5 font-medium rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60 ${
                selected 
                  ? 'bg-white shadow' 
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }`
            }>
              Tùy chỉnh
            </Tab>
          </TabList>
        </TabGroup>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Thời hạn thanh toán</h3>
        <div className="flex flex-wrap gap-4">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`px-5 py-3 rounded-lg border ${
                selectedPeriod === option.value
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {option.label}
                {option.value > 1 && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                    Giảm {packages[0]?.pricingOptions[option.value].discount || 0}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div 
            key={`${pkg.type}-${pkg.tier}`}
            className={`border rounded-xl overflow-hidden bg-white transition-all hover:shadow-md ${
              pkg.tier === 'premium' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className={`py-5 px-4 text-white ${
              pkg.tier === 'basic' ? 'bg-blue-600' :
              pkg.tier === 'advanced' ? 'bg-purple-600' :
              pkg.tier === 'premium' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
              'bg-gray-800'
            }`}>
              <h3 className="text-lg font-bold">{pkg.name}</h3>
              <p className="text-sm opacity-80">{pkg.description}</p>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm text-gray-500">Giá gói:</div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">
                    {formatCurrency(pkg.pricingOptions[selectedPeriod].monthlyPrice)}
                  </span>
                  <span className="text-gray-500 mb-1">/ tháng</span>
                </div>
                
                {selectedPeriod > 1 && (
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(pkg.pricingOptions[selectedPeriod].totalPrice)} thanh toán một lần
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-500">Đề xuất cho:</div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{pkg.recommendedFor}</span>
                </div>
                
                <div className="text-sm text-gray-500 mt-3">Tính năng bao gồm:</div>
                <ul className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => handlePackageSelect(pkg)}
                className={`w-full py-2.5 rounded-lg text-white font-medium ${
                  pkg.tier === 'basic' ? 'bg-blue-600 hover:bg-blue-700' :
                  pkg.tier === 'advanced' ? 'bg-purple-600 hover:bg-purple-700' :
                  pkg.tier === 'premium' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' :
                  'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                Chọn gói này
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}