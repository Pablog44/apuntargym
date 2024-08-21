import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Asegúrate de que la ruta sea correcta

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = auth.currentUser !== null; // Verifica si hay un usuario autenticado

  if (!isAuthenticated) {
    // Si no hay un usuario autenticado, redirige a la página de inicio de sesión
    return <Navigate to="/" />;
  }

  // Si hay un usuario autenticado, renderiza los hijos (children)
  return children;
};

export default ProtectedRoute;
