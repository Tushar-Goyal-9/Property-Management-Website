import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Property Dunia</h3>
            <p className="text-gray-400 text-sm">
              Find your dream property with India's most trusted real estate platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-white transition">Properties</Link></li>
              <li><Link to="/properties?listingType=Sale" className="hover:text-white transition">Buy</Link></li>
              <li><Link to="/properties?listingType=Rent" className="hover:text-white transition">Rent</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Agents</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/register?role=agent" className="hover:text-white transition">List Property</Link></li>
              <li><Link to="/dashboard/agent" className="hover:text-white transition">Agent Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: Tushar@gmail.com</li>
              <li>Phone: +91 xxxx xxxx</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Property Dunia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;