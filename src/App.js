import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Historial from './components/Historial';
import Layout from './components/Layout';
import './Styles.css';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        {/* Ruta de login, fuera del layout */}
        <Route path="/" element={<Login />} />

        {/* Rutas dentro del layout con la barra lateral */}
        <Route element={<Layout />}>
          <Route path="/registrar" element={<Dashboard />} />
          <Route path="/historial" element={<Historial />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
