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
          {/* SVG para la "X" */}
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        <nav className="sidebar-nav" onClick={closeSidebar}>
          <Link to="/registrar">Registrar</Link>
          <Link to="/historial">Ver Historial</Link>
          <Link to="/ajustes">Ajustes</Link>
          <Link to="/resultados">Resultados</Link>
          <Link to="/añadir">Añadir Grupos/Ejercicios</Link>
          <button onClick={() => alert('Cerrar sesión')}>Cerrar Sesión</button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
