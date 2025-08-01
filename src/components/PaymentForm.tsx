import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
}

const PaymentForm = ({ amount, onSuccess }: PaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // In a real application, this would be an API call to your backend
      // to create a Razorpay order and get the order ID
      const orderData = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ParkEase',
        description: 'Parking Slot Booking',
        handler: function (response: any) {
          // Handle successful payment
          console.log('Payment successful:', response);
          onSuccess();
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#00af93',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-2">Payment Amount</h4>
        <div className="text-2xl font-bold text-primary-600">₹{amount.toFixed(2)}</div>
      </div>

      <div className="flex items-center mb-4">
        <div className="bg-gray-100 p-3 rounded-md mr-3">
          <Lock size={24} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-600">
          Your payment is secured by Razorpay. We never store your card details.
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="btn btn-primary w-full flex justify-center items-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={18} className="mr-2" />
            Pay ₹{amount.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentForm;