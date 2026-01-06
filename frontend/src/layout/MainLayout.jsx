import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;
