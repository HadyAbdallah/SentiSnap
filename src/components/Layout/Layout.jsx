import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from "./Layout.module.scss";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  // Check if the current route is '/signin' or '/signup'
  const hideNavbarFooter = location.pathname === '/signin' || location.pathname === '/signup' | location.pathname === '/';

  return (
    <div>
      {/* Conditionally render Navbar and Footer based on route */}
      {!hideNavbarFooter && <Navbar />}
      <Outlet />
      {!hideNavbarFooter && <Footer />}
    </div>
  );
}