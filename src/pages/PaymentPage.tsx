import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../contexts/BookingContext';
import { usePayment } from '../contexts/PaymentContext';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookings } = useBookings();
  const { initiatePayment } = usePayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Booking Not Found</h1>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View All Bookings
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await initiatePayment(booking.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700">Booking Details</h2>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Parking Spot:</span> {booking.parkingSpotName}</p>
              <p><span className="font-medium">Date:</span> {booking.date}</p>
              <p><span className="font-medium">Time:</span> {booking.fromTime} - {booking.toTime}</p>
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700">Payment Summary</h2>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">₹{booking.price}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-md text-white font-medium
              ${isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>

          <button
            onClick={() => navigate('/bookings')}
            className="w-full py-3 px-4 rounded-md text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 