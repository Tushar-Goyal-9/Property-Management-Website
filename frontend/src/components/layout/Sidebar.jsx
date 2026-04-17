import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();

  const adminLinks = [
    { to: '/dashboard/admin', label: 'Overview', icon: '📊' },
    { to: '/dashboard/admin/users', label: 'Users', icon: '👥' },
    { to: '/dashboard/admin/properties', label: 'Properties', icon: '🏠' },
  ];

  const agentLinks = [
    { to: '/dashboard/agent', label: 'Overview', icon: '📊' },
    { to: '/dashboard/my-listings', label: 'My Listings', icon: '📋' },
    { to: '/dashboard/add-property', label: 'Add Property', icon: '➕' },
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/wishlist', label: 'Wishlist', icon: '❤️' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'agent' ? agentLinks : userLinks;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;