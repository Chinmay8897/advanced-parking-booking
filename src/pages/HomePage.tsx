import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSearch = () => {
    if (user) {
      // Pass the selected date to FindParkingPage so it reflects the user's choice
      navigate('/find-parking', { state: { date: selectedDate.toISOString() } });
    } else {
      navigate('/login');
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Get the first day of the month to calculate padding
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-50">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          {/* Left Content */}
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
              {user ? `Welcome back, ${user.name || user.email}!` : 'Find and Reserve Parking Spots in Real-Time'}
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Say goodbye to parking hassles. Book secure parking spaces in advance and
              enjoy stress-free parking experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <button
                  type="button"
                  className="btn btn-primary text-center px-8 py-3"
                  onClick={() => navigate('/find-parking', { state: { date: selectedDate.toISOString() } })}
                >
                  Find Parking Now
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary text-center px-8 py-3">
                  Find Parking Now
                </Link>
              )}
              <Link to="/contact" className="btn btn-secondary text-center px-8 py-3">
                How It Works
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D"
              alt="Parking garage"
              className="rounded-lg shadow-xl w-full object-cover h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Date & Time Search Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Check Available Parking Spots
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <h3 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
                        <div className="flex">
                          <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            onClick={handlePrevMonth}
                          >
                            &lt;
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded-full ml-1"
                            onClick={handleNextMonth}
                          >
                            &gt;
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="font-medium text-gray-500 py-1">{day}</div>
                        ))}

                        {/* Add padding for the first week */}
                        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                          <div key={`empty-${index}`} className="py-1"></div>
                        ))}

                        {/* Calendar days */}
                        {daysInMonth.map((date, index) => {
                          const isCurrentMonth = isSameMonth(date, currentMonth);
                          const isSelected = isSameDay(date, selectedDate);
                          const isCurrentDay = isToday(date);

                          return (
                            <div
                              key={index}
                              className={`calendar-day py-1 cursor-pointer rounded-full ${
                                !isCurrentMonth ? 'text-gray-400' : ''
                              } ${
                                isSelected ? 'bg-primary-500 text-white' :
                                isCurrentDay ? 'bg-gray-100' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleDateClick(date)}
                            >
                              {format(date, 'd')}
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
                    <select className="bg-transparent w-full focus:outline-none">
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
                    <select className="bg-transparent w-full focus:outline-none">
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

              <button
                className="btn btn-primary w-full mt-4 py-3"
                onClick={handleDateSearch}
              >
                Search Available Parking
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ParkEase</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="bg-primary-100 p-4 inline-block rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Availability</h3>
              <p className="text-gray-600">
                See parking availability in real-time. No more driving around looking for a spot.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="bg-primary-100 p-4 inline-block rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Booking</h3>
              <p className="text-gray-600">
                Reserve your spot in advance with our secure and easy booking system.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="bg-primary-100 p-4 inline-block rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Payment</h3>
              <p className="text-gray-600">
                Pay quickly and securely online. No cash or tickets needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Search for Parking</h3>
                <p className="text-gray-600">
                  Enter your destination, date, and time to find available parking spots near you.
                </p>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1575486306207-78ebfe3ff8da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fHBhcmtpbmclMjBzZWFyY2h8ZW58MHwwfDB8fHww"
                  alt="Search for parking"
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center mb-12">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pl-8">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Select and Book</h3>
                <p className="text-gray-600">
                  Choose your preferred parking spot from the available options and book it.
                </p>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1678414413532-1ca42d6a510b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHBhcmtpbmclMjBib29raW5nfGVufDB8MXwwfHx8MA%3D%3D"
                  alt="Book a spot"
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Park with Ease</h3>
                <p className="text-gray-600">
                  Arrive at the parking location, show your booking confirmation, and park your vehicle.
                </p>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1709364531162-6e613646afa8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZWFzeSUyMHBhcmtpbmd8ZW58MHwwfDB8fHww"
                  alt="Park your car"
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Parking Hassle-Free?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their parking experience with ParkEase.
          </p>
          <Link
            to={user ? "/find-parking" : "/register"}
            className="btn bg-white text-primary-500 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
          >
            {user ? "Find Parking Now" : "Sign Up for Free"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;