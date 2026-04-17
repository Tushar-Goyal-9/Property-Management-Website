import { Link } from 'react-router-dom';
import PageWrapper from '../components/common/PageWrapper';

const NotFound = () => {
  return (
    <PageWrapper>
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-teal-600">404</h1>
        <p className="text-2xl text-gray-700 mt-4">Page Not Found</p>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
        >
          Go Home
        </Link>
      </div>
    </div>
    </PageWrapper>
  );
};

export default NotFound;