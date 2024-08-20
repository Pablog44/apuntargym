// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeSidebar = () => {
    setIsExpanded(false);
  };

  return (
    <div>
      {/* Ícono de hamburguesa visible solo cuando el menú está cerrado */}
      {!isExpanded && (
        <button className="hamburger-icon" onClick={toggleSidebar}>
          &#9776;
        </button>
      )}

      {/* Barra lateral */}
      <div className={isExpanded ? "sidebar expanded" : "sidebar"}>
        <button className="close-button" onClick={toggleSidebar}>
          &times;
        </button>
        <nav className="sidebar-nav" onClick={closeSidebar}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/historial">Ver Historial</Link>
          <Link to="/ajustes">Ajustes</Link>
          <Link to="/resultados">Resultados</Link>
          <Link to="/nuevo">Añadir Grupos/Ejercicios</Link>
          <button onClick={() => alert('Cerrar sesión')}>Cerrar Sesión</button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
