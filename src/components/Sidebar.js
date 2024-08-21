import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Importa auth para cerrar sesión
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate(); // Necesario para redirigir después de cerrar sesión

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeSidebar = () => {
    setIsExpanded(false);
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        // Redirigir a la página de inicio de sesión después de cerrar sesión
        navigate('/');
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
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
        </nav>
        {/* Botón de cerrar sesión, que siempre está al final */}
        <div className="logout-container">
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
