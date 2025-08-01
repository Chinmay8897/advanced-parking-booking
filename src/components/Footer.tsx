import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center text-white font-bold text-xl mb-4">
              <Car className="mr-2" size={24} />
              <span>ParkEase</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Find and reserve parking spots in real-time. Say goodbye to parking hassles.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/in/aditya-sai-chinmay/" className="text-gray-300 hover:text-white transition">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com/Chinmay8897" className="text-gray-300 hover:text-white transition">
                <Github size={20} />
              </a>
              <a href="https://www.instagram.com/__._chinmay_.__/" className="text-gray-300 hover:text-white transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/find-parking" className="text-gray-300 hover:text-white transition">Find Parking</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-gray-300 hover:text-white transition">My Bookings</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition">Contact Us</Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 text-primary-400" />
                <span className="text-gray-300">Vignana Bharathi Institute of Technology Aushapur Hyderabad</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-primary-400" />
                <span className="text-gray-300">+91 8897425370</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-primary-400" />
                <span className="text-gray-300">adityasaichinmay@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-4">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} ParkEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;