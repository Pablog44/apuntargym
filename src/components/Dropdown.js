import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import './Dropdown.css';
import '../Styles.css';

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

  // Cierra el popup si se hace clic fuera
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
    <>
      <div
        className={`dropdown-trigger ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={toggleDropdown}
      >
        {selectedOption || placeholder || 'Selecciona una opción'}
      </div>
      {isOpen && (
        <div className="dropdown-backdrop">
          <div
            className={`dropdown-popup ${isDarkMode ? 'dark-mode' : ''}`}
            ref={dropdownRef}
          >
            <div className="dropdown-close" onClick={toggleDropdown}>
              &times;
            </div>
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
          </div>
        </div>
      )}
    </>
  );
}

export default Dropdown;
