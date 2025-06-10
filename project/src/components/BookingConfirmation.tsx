import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../contexts/BookingContext';

interface BookingConfirmationProps {
  booking: Booking;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your parking spot has been reserved</p>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Booking Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Parking Spot:</span> {booking.parkingSpotName}</p>
            <p><span className="font-medium">Date:</span> {booking.date}</p>
            <p><span className="font-medium">Time:</span> {booking.fromTime} - {booking.toTime}</p>
            <p><span className="font-medium">Amount:</span> ₹{booking.price}</p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate(`/payment/${booking.id}`)}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Proceed to Payment
          </button>
          <button
            onClick={() => navigate('/my-bookings')}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}; 