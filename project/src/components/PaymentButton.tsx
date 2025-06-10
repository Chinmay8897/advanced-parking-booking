import React from 'react';
import { usePayment } from '../contexts/PaymentContext';

interface PaymentButtonProps {
  bookingId: string;
  className?: string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ bookingId, className }) => {
  const { initiatePayment } = usePayment();

  const handlePayment = async () => {
    try {
      await initiatePayment(bookingId);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      // Handle error appropriately
    }
  };

  return (
    <button
      onClick={handlePayment}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${className}`}
    >
      Pay Now
    </button>
  );
}; 