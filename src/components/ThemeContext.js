// src/ThemeContext.js
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
      // Verifica si hay un tema guardado en localStorage
      return localStorage.getItem('theme') || 'light';
    });
  
    const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme); // Guarda el tema en localStorage
    };
  
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  