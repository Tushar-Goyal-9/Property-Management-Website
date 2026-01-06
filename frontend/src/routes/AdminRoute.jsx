import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" />;

  return user?.role === "admin"
    ? <Outlet />
    : <Navigate to="/" />;
};

export default AdminRoute;
