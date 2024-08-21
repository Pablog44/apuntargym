import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Historial from './components/Historial';
import Ajustes from './components/Ajustes';
import Añadir from './components/Añadir';
import Resultados from './components/Resultados';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './Styles.css';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        {/* Ruta de login, fuera del layout */}
        <Route path="/" element={<Login />} />

        {/* Rutas dentro del layout con la barra lateral */}
        <Route element={<Layout />}>
          <Route
            path="/registrar"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute>
                <Historial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resultados"
            element={
              <ProtectedRoute>
                <Resultados />
              </ProtectedRoute>
            }
          />
          <Route
            path="/añadir"
            element={
              <ProtectedRoute>
                <Añadir />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ajustes"
            element={
              <ProtectedRoute>
                <Ajustes />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
