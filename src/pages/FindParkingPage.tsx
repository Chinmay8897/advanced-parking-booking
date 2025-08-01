import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react';
import { parkingService, ParkingLocation } from '../services/parkingService';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type FilterOption = 'all' | 'indoor' | 'outdoor' | 'ev-charging' | 'security' | 'covered';

const FindParkingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState('10:00 AM');
  const [toTime, setToTime] = useState('11:00 AM');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication status
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    // Load parking locations
    const loadParkingLocations = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await parkingService.getParkingLocations();
        
        if (error) {
          console.error('Error loading parking locations:', error);
          return;
        }
        
        setLocations(data || []);
      } catch (error) {
        console.error('Error loading parking locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParkingLocations();
  }, [user, authLoading, navigate]);
  
  // Filter locations based on selected filter
  useEffect(() => {
    const loadAndFilterLocations = async () => {
      try {
        const { data, error } = await parkingService.getParkingLocations();
        
        if (error) {
          console.error('Error loading parking locations:', error);
          return;
        }
        
        const allLocations = data || [];
        
        if (activeFilter === 'all') {
          setLocations(allLocations);
          return;
        }
        
        const filteredLocations = allLocations.filter(location => {
          return location.amenities.some(amenity => 
            amenity.toLowerCase().replace(/\s/g, '-') === activeFilter
          );
        });
        
        setLocations(filteredLocations);
      } catch (error) {
        console.error('Error filtering locations:', error);
      }
    };
    
    loadAndFilterLocations();
  }, [activeFilter]);
  
  const handleBooking = (location: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedLocation(location);
    setIsBookingModalOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parking locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center mb-8">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-4">Find and Book Parking</h1>
            <p className="text-gray-600 text-lg mb-6">
              Search for available parking spots at your preferred location and time.
            </p>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1575486306207-78ebfe3ff8da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fHBhcmtpbmclMjBzZWFyY2h8ZW58MHwwfDB8fHww" 
              alt="Parking garage" 
              className="rounded-lg shadow-md w-full h-48 object-cover"
            />
          </div>
        </div>
        
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Date Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div 
                className="input-field flex items-center cursor-pointer"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar size={18} className="text-gray-500 mr-2" />
                <span>{format(selectedDate, 'MMMM do, yyyy')}</span>
              </div>
              
              {/* Calendar Dropdown */}
              {showCalendar && (
                <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md p-3 border border-gray-200 w-64">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{format(selectedDate, 'MMMM yyyy')}</h3>
                    <div className="flex">
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        &lt;
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-full ml-1">
                        &gt;
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="font-medium text-gray-500 py-1">{day}</div>
                    ))}
                    
                    {/* Placeholder for full calendar implementation */}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const isToday = i === 9; // Mock for demo
                      return (
                        <div
                          key={i}
                          className={`calendar-day ${
                            isToday ? 'bg-primary-500 text-white' : ''
                          }`}
                          onClick={() => {
                            setShowCalendar(false);
                          }}
                        >
                          {(i % 31) + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* From Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="input-field flex items-center">
                <Clock size={18} className="text-gray-500 mr-2" />
                <select 
                  className="bg-transparent w-full focus:outline-none"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                >
                  <option value="6:00 AM">6:00 AM</option>
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                </select>
              </div>
            </div>
            
            {/* To Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="input-field flex items-center">
                <Clock size={18} className="text-gray-500 mr-2" />
                <select 
                  className="bg-transparent w-full focus:outline-none"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                >
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                </select>
              </div>
            </div>
          </div>
          
          <button className="btn btn-primary w-full py-3">
            Search Available Parking
          </button>
        </div>
        
        {/* Filter Options */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max pb-2">
            <button
              className={`px-4 py-2 rounded-md flex items-center text-sm ${
                activeFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              <Filter size={16} className="mr-1" />
              All
            </button>
            <button
              className={`px-4 py-2 rounded-md flex items-center text-sm ${
                activeFilter === 'indoor'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveFilter('indoor')}
            >
              Indoor
            </button>
            <button
              className={`px-4 py-2 rounded-md flex items-center text-sm ${
                activeFilter === 'outdoor'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveFilter('outdoor')}
            >
              Outdoor
            </button>
            <button
              className={`px-4 py-2 rounded-md flex items-center text-sm ${
                activeFilter === 'covered'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveFilter('covered')}
            >
              Covered
            </button>
            <button
              className={`px-4 py-2 rounded-md flex items-center text-sm ${
                activeFilter === 'security'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveFilter('security')}
            >
              Security
            </button>
            <button
              className={`px-4 py-2 rounded-md flex items-center text-sm ${
                activeFilter === 'ev-charging'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveFilter('ev-charging')}
            >
              EV Charging
            </button>
          </div>
        </div>
        
        {/* Results Sorting */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{locations.length} Parking Locations Found</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Distance</option>
            </select>
          </div>
        </div>
        
        {/* Parking Location Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <div key={index} className="parking-card overflow-hidden">
              <img 
                src={location.image} 
                alt={location.name} 
                className="w-full h-40 object-cover"
              />
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{location.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin size={16} className="mr-1" />
                      <span>{location.address}</span>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    {location.spotsAvailable} of {location.totalSpots} spots free
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {location.amenities.map((amenity, i) => (
                    <span 
                      key={i} 
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-primary-600">
                    ${location.price}<span className="text-sm text-gray-500">/hour</span>
                  </div>
                  <button 
                    className="btn btn-accent"
                    onClick={() => handleBooking(location)}
                  >
                    Book a Slot
                  </button>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <h4 className="font-medium mb-2">Available Slots</h4>
                <div className="grid grid-cols-4 gap-2">
                  {location.slots.map((slot, i) => (
                    <button 
                      key={i} 
                      className={`slot-button ${
                        slot.status === 'available' ? 'available' : 
                        slot.status === 'unavailable' ? 'unavailable' : ''
                      }`}
                      disabled={slot.status === 'unavailable'}
                      onClick={() => handleBooking({...location, selectedSlot: slot.name})}
                    >
                      {slot.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Booking Modal */}
        {isBookingModalOpen && selectedLocation && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            location={selectedLocation}
            date={selectedDate}
            fromTime={fromTime}
            toTime={toTime}
          />
        )}
      </div>
    </div>
  );
};

export default FindParkingPage;