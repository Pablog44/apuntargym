// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [muscleGroups, setMuscleGroups] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
        if (!user) {
            navigate('/');
        }
        });

        const fetchMuscleGroups = async () => {
        const querySnapshot = await getDocs(collection(db, 'muscleGroups'));
        setMuscleGroups(querySnapshot.docs.map(doc => doc.id));
        };

        fetchMuscleGroups();
    }, [navigate]);

    const handleLogout = () => {
        signOut(auth).then(() => {
        navigate('/');
        });
    };

    return (
        <div>
        <header>
            <h1>Registro de Ejercicios</h1>
            <button onClick={handleLogout}>Cerrar Sesión</button>
        </header>
        <main>
            <section>
            <h2>Selecciona un Grupo Muscular</h2>
            <select>
                {muscleGroups.map(group => (
                <option key={group} value={group}>
                    {group}
                </option>
                ))}
            </select>
            </section>
            {/* Aquí podrías añadir más lógica para manejar el resto de la funcionalidad */}
        </main>
        </div>
    );
    }

export default Dashboard;
