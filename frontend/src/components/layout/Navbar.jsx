import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
  ];

  const dashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return { to: '/dashboard/admin', label: 'Admin Dashboard' };
      case 'agent':
        return { to: '/dashboard/agent', label: 'Agent Dashboard' };
      default:
        return { to: '/dashboard', label: 'Dashboard' };
    }
  };

  // Helper to check if location path matches exactly
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-teal-600">Property</span>
              <span className="text-xl font-bold tracking-tight text-slate-800">Dunia</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium text-sm transition-colors duration-150 ${
                  isActive(link.to)
                    ? 'text-teal-655 text-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {dashboardLink() && (
              <Link
                to={dashboardLink().to}
                className={`font-medium text-sm transition-colors duration-150 ${
                  isActive(dashboardLink().to)
                    ? 'text-teal-655 text-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                {dashboardLink().label}
              </Link>
            )}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  className="flex items-center space-x-1.5 text-slate-700 hover:text-teal-600 font-medium text-sm focus:outline-none transition-colors duration-150"
                >
                  <span>{user.name}</span>
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1.5 z-50 border border-slate-200/80 shadow-slate-200/50"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      to="/wishlist"
                      className={`block px-4 py-2 text-sm transition-colors duration-150 ${
                        isActive('/wishlist')
                          ? 'bg-slate-50 text-teal-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-teal-600'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isActive('/login')
                      ? 'text-teal-600 font-semibold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 active:scale-[0.99] hover:scale-[1.01] transition-all duration-150"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-teal-600 focus:outline-none transition-colors duration-150"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-3">
          <div className="px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive(link.to)
                    ? 'text-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {dashboardLink() && (
              <Link
                to={dashboardLink().to}
                className={`block py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive(dashboardLink().to)
                    ? 'text-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {dashboardLink().label}
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/wishlist"
                  className={`block py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive('/wishlist')
                      ? 'text-teal-600 font-semibold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Wishlist
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-slate-600 hover:text-teal-600 font-medium transition-colors duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 mt-2">
                <Link
                  to="/login"
                  className={`block text-center py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive('/login')
                      ? 'text-teal-600 font-semibold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-2 text-sm bg-teal-600 text-white rounded-lg font-medium transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;