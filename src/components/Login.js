// src/components/Login.js
import React, { useEffect } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
        if (user) {
            // Si el usuario ya está autenticado, redirigir al panel principal
            navigate('/registrar');
        }
        });
    }, [navigate]);

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            console.log('Autenticación exitosa:', result.user);
            navigate('/registrar');
        })
        .catch((error) => {
            console.error('Error durante la autenticación:', error.message);
            alert(`Error de autenticación: ${error.message}`);
        });
    };

    return (
        <div className="login-container">
        <h2>Inicia sesión con tu cuenta de Google</h2>
        <button onClick={handleGoogleSignIn}>Iniciar Sesión con Google</button>
        </div>
    );
    }

export default Login;
