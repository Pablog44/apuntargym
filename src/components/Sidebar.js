// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Estilo para la barra lateral

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={isExpanded ? "sidebar expanded" : "sidebar"}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isExpanded ? "<<" : ">>"}
      </button>
      <nav className="sidebar-nav">
        <Link to="/dashboard">
          <span className="icon">🏠</span>
          {isExpanded && <span className="text">Dashboard</span>}
        </Link>
        <Link to="/historial">
          <span className="icon">📜</span>
          {isExpanded && <span className="text">Ver Historial</span>}
        </Link>
        <Link to="/ajustes">
          <span className="icon">⚙️</span>
          {isExpanded && <span className="text">Ajustes</span>}
        </Link>
        <Link to="/resultados">
          <span className="icon">📊</span>
          {isExpanded && <span className="text">Resultados</span>}
        </Link>
        <Link to="/nuevo">
          <span className="icon">➕</span>
          {isExpanded && <span className="text">Añadir Grupos/Ejercicios</span>}
        </Link>
        <button onClick={() => alert('Cerrar sesión')}>
          <span className="icon">🚪</span>
          {isExpanded && <span className="text">Cerrar Sesión</span>}
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
