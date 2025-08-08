import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  
  // Optional: navigate after logout
  // Import useNavigate if redirection is desired
  // const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await logout();
    if (error) {
      console.error('Logout error:', error);
    }
    // If you want to redirect after logout, uncomment:
    // navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            ParkEase
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <Link
                  to="/my-bookings"
                  className="text-gray-700 hover:text-primary-600"
                >
                  My Bookings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 