import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import '../Styles.css';

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Outlet /> {/* Aquí se renderizan las rutas hijas */}
      </div>
    </div>
  );
};

export default Layout;
