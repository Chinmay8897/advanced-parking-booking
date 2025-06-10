import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="space-x-4">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;