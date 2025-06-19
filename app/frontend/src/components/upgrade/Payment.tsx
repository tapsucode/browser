import { SelectedPackage } from '../../types/upgrade';
import { formatCurrency } from '../../utils/pricing';
import { CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';

interface PaymentProps {
  selectedPackage: SelectedPackage;
  paymentMethod: 'card' | 'bank' | 'wallet';
  isProcessing: boolean;
  isComplete: boolean;
  onPaymentMethodChange: (method: 'card' | 'bank' | 'wallet') => void;
  onBack: () => void;
  onComplete: () => void;
  onSubmit: (paymentDetails: any) => void;
}

const Payment = ({
  selectedPackage,
  paymentMethod,
  isProcessing,
  isComplete,
  onPaymentMethodChange,
  onBack,
  onComplete,
  onSubmit
}) => {
  const { package: pkg, period } = selectedPackage;
  const pricing = pkg.pricingOptions[period];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gather form data
    const paymentDetails = {
      method: paymentMethod,
      // Additional fields depending on payment method
      ...(paymentMethod === 'card' && {
        cardName: (document.getElementById('cardName') as HTMLInputElement)?.value,
        cardNumber: (document.getElementById('cardNumber') as HTMLInputElement)?.value,
        expiry: (document.getElementById('expiry') as HTMLInputElement)?.value,
        cvc: (document.getElementById('cvc') as HTMLInputElement)?.value,
      }),
      ...(paymentMethod === 'bank' && {
        transactionId: (document.getElementById('transactionId') as HTMLInputElement)?.value,
      })
    };
    
    onSubmit(paymentDetails);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="rounded-full bg-green-100 p-4 mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          Cảm ơn bạn đã nâng cấp. Gói {pkg.name} của bạn đã được kích hoạt.
        </p>
        <button
          onClick={onComplete}
          className="py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          Tiếp tục
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thanh Toán</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Phương thức thanh toán</h3>
            
            <div className="space-y-4 mb-6">
              <div 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => onPaymentMethodChange('card')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                  paymentMethod === 'card' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Thẻ tín dụng / Thẻ ghi nợ</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, JCB</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">VISA</span>
                  </div>
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">MC</span>
                  </div>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'bank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => onPaymentMethodChange('bank')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                  paymentMethod === 'bank' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'bank' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Chuyển khoản ngân hàng</div>
                  <div className="text-sm text-gray-500">Chuyển khoản trực tiếp từ tài khoản của bạn</div>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'wallet' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => onPaymentMethodChange('wallet')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                  paymentMethod === 'wallet' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'wallet' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Ví điện tử</div>
                  <div className="text-sm text-gray-500">MoMo, ZaloPay, VNPay</div>
                </div>
              </div>
            </div>
            
            {paymentMethod === 'card' && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Tên trên thẻ
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Số thẻ
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardNumber"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC/CVV
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
            
            {paymentMethod === 'bank' && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Thông tin chuyển khoản</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Vui lòng chuyển khoản đến tài khoản sau và nhập thông tin chuyển khoản bên dưới:
                </p>
                
                <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Ngân hàng:</div>
                    <div className="font-medium">Vietcombank</div>
                    
                    <div className="text-gray-500">Số tài khoản:</div>
                    <div className="font-medium">1234567890</div>
                    
                    <div className="text-gray-500">Chủ tài khoản:</div>
                    <div className="font-medium">CÔNG TY ABC</div>
                    
                    <div className="text-gray-500">Nội dung CK:</div>
                    <div className="font-medium">UPGRADE {pkg.tier.toUpperCase()}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã giao dịch
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập mã giao dịch"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'wallet' && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col items-center mb-4">
                  <div className="mb-4 w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-600">Mã QR thanh toán</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Quét mã QR bằng ứng dụng ví điện tử để thanh toán
                  </p>
                </div>
                
                <div className="flex justify-center gap-4 mb-4">
                  <button className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-50">
                    MoMo
                  </button>
                  <button className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-50">
                    ZaloPay
                  </button>
                  <button className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-50">
                    VNPay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Gói:</span>
                <span className="font-medium">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loại:</span>
                <span className="font-medium capitalize">{pkg.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời hạn:</span>
                <span className="font-medium">{period} tháng</span>
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Đơn giá:</span>
                <span>{formatCurrency(pkg.pricingOptions[1].monthlyPrice)} / tháng</span>
              </div>
              
              {period > 1 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Giảm giá:</span>
                  <span>-{pricing.discount}%</span>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng thanh toán:</span>
                <span>{formatCurrency(pricing.totalPrice)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {period > 1
                  ? `Thanh toán một lần cho ${period} tháng`
                  : 'Thanh toán hàng tháng'}
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
                  isProcessing
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
              </button>
              
              <button
                onClick={onBack}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;