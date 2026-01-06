import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import AddProperty from "./pages/AddProperty";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Routes>
      {/* ===== PUBLIC + ADMIN WITH LAYOUT ===== */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="property/:id" element={<PropertyDetails />} />

        {/* ADMIN ONLY (still shows Navbar/Footer) */}
        <Route element={<AdminRoute />}>
          <Route path="add-property" element={<AddProperty />} />
        </Route>
      </Route>

      {/* ===== PUBLIC (NO LAYOUT) ===== */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
