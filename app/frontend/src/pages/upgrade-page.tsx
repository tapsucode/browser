import { useState } from 'react';
import PackageSelection from '../components/upgrade/PackageSelection';
import PackageConfirmation from '../components/upgrade/PackageConfirmation';
import Payment from '../components/upgrade/Payment';
import StepIndicator from '../components/upgrade/StepIndicator';
import { useUpgrade } from '../hooks/us/useUpgrade';

export default function UpgradePage() {
  // Sử dụng hook mới thay thế cho useUpgradePage
  const {
    selectedPackage,
    selectedPeriod,
    setSelectedPackage,
    setSelectedPeriod,
    calculateFinalPrice,  
    processPayment,
    isProcessingPayment: isProcessing // Rename to match component prop
  } = useUpgrade();
  
  // Quản lý trạng thái local của trang
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isComplete, setIsComplete] = useState(false);
  
  // Handler chọn gói
  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg);
    setCurrentStep(2);
  };
  
  // Handler xác nhận gói
  const handleConfirm = () => {
    setCurrentStep(3);
  };
  
  // Handler quay lại
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Handler hoàn tất
  const handleComplete = () => {
    setIsComplete(true);
  };
  
  // Handler thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };
  
  // Handler submit thanh toán
  const handlePaymentSubmit = (paymentDetails: any) => {
    if (!selectedPackage) return;
    
    processPayment(paymentMethod, paymentDetails);
    handleComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
          Nâng Cấp
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          Mở khóa tất cả các tính năng cao cấp và tận hưởng trải nghiệm duyệt web an toàn, riêng tư nhất
        </p>

        <div className="mb-12">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto">
          {currentStep === 1 && (
            <PackageSelection onSelectPackage={handlePackageSelect} />
          )}
          
          {currentStep === 2 && selectedPackage && (
            <PackageConfirmation 
              selectedPackage={selectedPackage} 
              onConfirm={handleConfirm} 
              onBack={handleBack}
            />
          )}
          
          {currentStep === 3 && selectedPackage && (
            <Payment 
              selectedPackage={selectedPackage} 
              paymentMethod={paymentMethod}
              onPaymentMethodChange={handlePaymentMethodChange}
              isProcessing={isProcessing}
              isComplete={isComplete}
              onBack={handleBack} 
              onComplete={handleComplete}
              onSubmit={handlePaymentSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}