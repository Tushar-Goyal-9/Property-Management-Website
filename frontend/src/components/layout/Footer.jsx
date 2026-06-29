import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Footer = () => {
  const { user } = useAuthStore();

  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <h3 className="text-base font-bold tracking-tight text-white">Property Dunia</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Discover and manage dream properties with India's premium real estate platform.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors duration-150">Home</Link></li>
              <li><Link to="/properties" className="hover:text-white transition-colors duration-150">Properties</Link></li>
              <li><Link to="/properties?listingType=Sale" className="hover:text-white transition-colors duration-150">Buy</Link></li>
              <li><Link to="/properties?listingType=Rent" className="hover:text-white transition-colors duration-150">Rent</Link></li>
            </ul>
          </div>
          <div>
            {user?.role === 'admin' ? (
              <>
                <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4">For Admins</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/dashboard/admin" className="hover:text-white transition-colors duration-150">Admin Dashboard</Link></li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4">For Agents</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/dashboard" className="hover:text-white transition-colors duration-150">Become an Agent</Link></li>
                  <li><Link to="/dashboard/agent" className="hover:text-white transition-colors duration-150">Agent Dashboard</Link></li>
                </ul>
              </>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-white transition-colors duration-150">Email: jainendergoel@gmail.com</li>
              <li className="hover:text-white transition-colors duration-150">Phone: +91 9356556000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Property Dunia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;