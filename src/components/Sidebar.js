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
            <Link to="/dashboard">🏠 Dashboard</Link>
            <Link to="/historial">📜 Ver Historial</Link>
            <Link to="/ajustes">⚙️ Ajustes</Link>
            <Link to="/resultados">📊 Resultados</Link>
            <Link to="/nuevo">➕ Añadir Grupos/Ejercicios</Link>
            <button onClick={() => alert('Cerrar sesión')}>🚪 Cerrar Sesión</button>
        </nav>
        </div>
    );
    };

export default Sidebar;
