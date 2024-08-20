// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import './Styles.css'; // Asegúrate de que los estilos generales estén importados<
import Historial from './components/Historial'; 

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registrar" element={<Dashboard />} />
          <Route path="/historial" element={<Historial />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
