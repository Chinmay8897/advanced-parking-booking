import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const { bookings, getUserBookings, cancelBooking, loading } = useBookings();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'cancelled' | 'pending' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      if (user) {
        await getUserBookings();
        setIsLoading(false);
      }
    };
    loadBookings();
  }, [user, getUserBookings]);

  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === selectedStatus);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(bookingId);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedStatus('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === 'confirmed'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedStatus('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === 'confirmed'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedStatus('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === 'pending'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedStatus('pending')}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === 'cancelled'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedStatus('cancelled')}
              >
                Cancelled
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === 'completed'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedStatus('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">No bookings found.</p>
              </div>
            ) : (
              filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className={`bg-white rounded-lg shadow-md p-6 ${
                    booking.status === 'cancelled' ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{booking.parkingSpotName}</h3>
                      <div className="space-y-2">
                                              <div className="flex items-center text-gray-600">
                        <Calendar size={18} className="mr-2" />
                        <span>{format(new Date(booking.start_time), 'MMMM do, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-2" />
                        <span>{format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        <span>{booking.parking_slot_name}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Total Amount: ₹{booking.total_amount}</span>
                      </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium mr-4 ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Cancel Booking"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;