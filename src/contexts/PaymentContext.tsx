import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useBookings } from './BookingContext';

// Define the Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: any; // Using any here since the type definition is complex
  }
}

type PaymentContextType = {
  initiatePayment: (bookingId: string) => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { bookings } = useBookings();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const options: RazorpayOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
      amount: booking.price * 100, // Amount in smallest currency unit (paise for INR)
      currency: "INR",
      name: "ParkEase",
      description: `Parking Booking - ${booking.parkingSpotName}`,
      order_id: "", // This will be set after creating an order on your backend
      handler: function (response: any) {
        // Handle successful payment
        console.log(response);
        // You should verify the payment on your backend here
      },
      prefill: {
        name: "User Name", // You can get this from your user context
        email: "user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#3399cc"
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <PaymentContext.Provider value={{ initiatePayment }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 