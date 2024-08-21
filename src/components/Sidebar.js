import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Importa auth para cerrar sesión
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

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
      {!isExpanded && (
        <button className="hamburger-icon" onClick={toggleSidebar}>
          &#9776;
        </button>
      )}

      <div className={isExpanded ? "sidebar expanded" : "sidebar"}>
        <button className="close-button" onClick={toggleSidebar}>
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <nav className="sidebar-nav" onClick={closeSidebar}>
          <Link to="/registrar">Registrar</Link>
          <Link to="/historial">Ver Historial</Link>
          <Link to="/ajustes">Ajustes</Link>
          <Link to="/resultados">Resultados</Link>
          <Link to="/añadir">Añadir Grupos/Ejercicios</Link>
        </nav>
        <div className="logout-container">
          <div className="logout-circle" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M69.313 54.442a2 2 0 01-1.147-.363 2.002 2.002 0 01-.487-2.786l10.118-14.399L67.679 22.495a2 2 0 012.786-2.786l10.926 15.549a2 2 0 010 2.3L70.952 53.592a2.003 2.003 0 01-1.639.85zM57.693 30.092a2 2 0 002-2V2a2 2 0 00-2-2H9.759a2 2 0 00-1.74.978 2 2 0 00-.258 1.83V72.787c0 .558.22 1.083.614 1.478.395.395.92.614 1.478.614h31.016a2 2 0 002-2v-17h14.918a2 2 0 002-2V45a2 2 0 10-4 0v20.787H42.775V18.213a2 2 0 00-1.074-1.772L17.902 4h37.791V28.092a2 2 0 002 2zM80.241 38.894H47.536a2 2 0 110-4h32.705a2 2 0 110 4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
