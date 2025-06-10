import { useState } from 'react';
import { X, MapPin, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  location: any;
  date: Date;
  fromTime: string;
  toTime: string;
};

enum BookingStep {
  SlotSelection,
  Confirmation
}

const BookingModal = ({ isOpen, onClose, location, date, fromTime, toTime }: BookingModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const [selectedSlot, setSelectedSlot] = useState<string>(location.selectedSlot || '');
  const [bookingStep, setBookingStep] = useState<BookingStep>(BookingStep.SlotSelection);
  
  if (!isOpen) return null;
  
  const handleSlotSelect = (slotName: string) => {
    setSelectedSlot(slotName);
  };
  
  const confirmBooking = () => {
    if (!selectedSlot || !user) return;
    
    // Create the booking
    addBooking({
      userId: user.id,
      parkingSpotId: selectedSlot,
      parkingSpotName: location.name,
      date: date.toISOString(),
      fromTime,
      toTime,
      status: 'confirmed',
      price: location.price
    });
    
    setBookingStep(BookingStep.Confirmation);
  };
  
  // Calculate booking duration and amount
  const calculateHours = () => {
    // This is a simplified implementation
    return 1; // For demo, assuming 1 hour
  };
  
  const calculateAmount = () => {
    return (calculateHours() * location.price).toFixed(2);
  };

  const handleViewBookings = () => {
    onClose();
    navigate('/my-bookings');
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-modal max-h-[90vh] overflow-y-auto w-full max-w-md md:max-w-lg z-10 slide-up">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={24} />
          </button>
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{location.name}</h2>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin size={16} className="mr-1" />
              <span>{location.address}</span>
            </div>
          </div>
          
          {/* Modal Content - Step 1: Slot Selection */}
          {bookingStep === BookingStep.SlotSelection && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Select a Parking Slot</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex flex-col md:flex-row md:justify-between mb-3">
                    <div className="flex items-center mb-2 md:mb-0">
                      <Calendar size={18} className="text-gray-500 mr-2" />
                      <span>{format(date, 'MMMM do, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={18} className="text-gray-500 mr-2" />
                      <span>{fromTime} - {toTime}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {location.slots.map((slot: any, i: number) => (
                      <button 
                        key={i} 
                        className={`slot-button ${
                          slot.status === 'unavailable' ? 'unavailable' : 
                          selectedSlot === slot.name ? 'selected' : 'available'
                        }`}
                        disabled={slot.status === 'unavailable'}
                        onClick={() => handleSlotSelect(slot.name)}
                      >
                        {slot.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center mt-3 space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-sm text-gray-600">Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-sm text-gray-600">Unavailable</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">{format(date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">{fromTime} - {toTime} ({calculateHours()} hours)</span>
                    </div>
                    {selectedSlot && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Slot</span>
                        <span className="font-medium">{selectedSlot}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-medium">₹{location.price}/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Duration</span>
                      <span className="font-medium">{calculateHours()} hours</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium">Amount to be Paid</span>
                      <span className="font-bold text-primary-600">₹{calculateAmount()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-primary w-full"
                disabled={!selectedSlot}
                onClick={confirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          )}
          
          {/* Modal Content - Step 2: Confirmation */}
          {bookingStep === BookingStep.Confirmation && (
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle size={64} className="text-green-500" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 mb-6">
                  Your parking spot has been successfully booked. A confirmation has been sent to your email.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium mb-3">Booking Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Parking Location</p>
                      <p className="font-medium">{location.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{location.address}</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{format(date, 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{fromTime} - {toTime}</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Slot</p>
                        <p className="font-medium">{selectedSlot}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount to be Paid</p>
                        <p className="font-medium text-primary-600">₹{calculateAmount()}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Please pay ₹{calculateAmount()} at the parking location before parking your vehicle.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button 
                    className="btn btn-primary"
                    onClick={onClose}
                  >
                    Done
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleViewBookings}
                  >
                    View My Bookings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;