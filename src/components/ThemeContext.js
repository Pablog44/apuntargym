import React, { createContext, useContext, useState, useEffect } from 'react';

// Crea el contexto del tema
const ThemeContext = createContext();

// Hook personalizado para usar el contexto del tema
export const useTheme = () => useContext(ThemeContext);

// Proveedor del contexto del tema
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    // Almacena el tema seleccionado en localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // Cambia la clase del body para aplicar los estilos correctos
    document.body.className = isDarkMode ? 'dark-mode' : '';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
