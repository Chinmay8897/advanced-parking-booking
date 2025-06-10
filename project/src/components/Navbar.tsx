import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Car, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center text-primary-500 font-bold text-xl">
            <Car className="mr-2" size={24} />
            <span>ParkEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className={({isActive}) => 
                isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/find-parking" 
              className={({isActive}) => 
                isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
              }
            >
              Find Parking
            </NavLink>
            {isAuthenticated && (
              <NavLink 
                to="/my-bookings" 
                className={({isActive}) => 
                  isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
                }
              >
                My Bookings
              </NavLink>
            )}
            <NavLink 
              to="/contact" 
              className={({isActive}) => 
                isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="mr-4 text-sm">
                  <span className="text-gray-600">Hello, </span>
                  <span className="font-medium">{user?.name.split(' ')[0] || 'User'}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-gray-600 hover:text-primary-500"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 fade-in">
            <nav className="flex flex-col space-y-4">
              <NavLink 
                to="/" 
                className={({isActive}) => 
                  isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
                }
                onClick={closeMenu}
              >
                Home
              </NavLink>
              <NavLink 
                to="/find-parking" 
                className={({isActive}) => 
                  isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
                }
                onClick={closeMenu}
              >
                Find Parking
              </NavLink>
              {isAuthenticated && (
                <NavLink 
                  to="/my-bookings" 
                  className={({isActive}) => 
                    isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
                  }
                  onClick={closeMenu}
                >
                  My Bookings
                </NavLink>
              )}
              <NavLink 
                to="/contact" 
                className={({isActive}) => 
                  isActive ? "text-primary-500 font-medium" : "text-gray-600 hover:text-primary-500"
                }
                onClick={closeMenu}
              >
                Contact
              </NavLink>
              
              {/* Mobile User Actions */}
              {isAuthenticated ? (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center mb-2">
                    <User size={18} className="mr-2 text-gray-600" />
                    <span className="font-medium">{user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center text-gray-600 hover:text-primary-500"
                  >
                    <LogOut size={18} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 flex flex-col space-y-2">
                  <Link 
                    to="/login" 
                    className="btn btn-secondary"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;