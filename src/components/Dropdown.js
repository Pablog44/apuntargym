// Dropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import './Dropdown.css';

function Dropdown({ options, selectedOption, onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  // Cierra el desplegable si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`dropdown-container ${isDarkMode ? 'dark-mode' : ''}`}
      ref={dropdownRef}
    >
      <div className="dropdown-selected" onClick={toggleDropdown}>
        {selectedOption || placeholder || 'Selecciona una opción'}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option}
              className="dropdown-option"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
