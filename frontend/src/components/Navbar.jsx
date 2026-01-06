import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let role = null;

  // ✅ SAFE role check (prevents blank screen)
  try {
    role = token ? getUserRole() : null;
  } catch  {
    role = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-semibold tracking-wide">
          <span className="text-blue-600">Property</span> Dunia
        </Link>

        {/* Links */}
        <ul className="flex space-x-6 text-sm font-medium items-center">

          <li>
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>

          {/* ✅ ADMIN ONLY */}
          {role === "admin" && (
            <li>
              <Link
                to="/add-property"
                className="text-blue-600 font-semibold hover:underline"
              >
                Add Property
              </Link>
            </li>
          )}

          {!token ? (
            <li>
              <Link to="/login" className="hover:text-blue-600">
                Login
              </Link>
            </li>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
