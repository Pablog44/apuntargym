import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Historial from './components/Historial';
import Ajustes from './components/Ajustes';
import Añadir from './components/Añadir';
import Resultados from './components/Resultados'; // Importa el nuevo componente
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
          <Route path="/resultados" element={<Resultados />} /> {/* Nueva ruta */}
          <Route path="/añadir" element={<Añadir />} /> 
          <Route path="/ajustes" element={<Ajustes />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
