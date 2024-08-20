// src/components/Historial.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Historial() {
    const [exerciseRecords, setExerciseRecords] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
            navigate('/');
            } else {
            loadExerciseRecords(user.uid);
            }
        });
        };

        fetchData();
    }, [navigate]);

    const loadExerciseRecords = async (userId) => {
        const recordsQuery = query(
        collection(db, 'exerciseRecords'),
        where('userId', '==', userId),
        orderBy('dateTime', 'desc')
        );

        const snapshot = await getDocs(recordsQuery);
        const records = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        }));

        setExerciseRecords(records);
    };

    const confirmDeleteRecord = async (docId, muscleGroup, exercise) => {
        const confirmation = window.confirm(
        `¿Estás seguro que deseas eliminar el ejercicio "${exercise}" del grupo muscular "${muscleGroup}"?`
        );
        if (confirmation) {
        await deleteRecord(docId);
        }
    };

    const deleteRecord = async (docId) => {
        try {
        await deleteDoc(doc(db, 'exerciseRecords', docId));
        setExerciseRecords(exerciseRecords.filter((record) => record.id !== docId));
        alert('Registro de ejercicio eliminado.');
        } catch (error) {
        console.error('Error eliminando registro de ejercicio:', error);
        }
    };

    const handleLogout = async () => {
        try {
        await signOut(auth);
        navigate('/');
        } catch (error) {
        console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div>
        <header>
            <h1>Historial de Ejercicios</h1>
            <button onClick={handleLogout}>Cerrar Sesión</button>
            <button onClick={() => navigate('/registrar')}>Registrar Nuevo Ejercicio</button>
        </header>
        <main>
            <section id="records-section">
            <h2>Historial de Ejercicios</h2>
            <ul>
                {exerciseRecords.map((record) => {
                const formattedDateTime = new Date(record.dateTime).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return (
                    <li key={record.id}>
                    {`${formattedDateTime} - ${record.muscleGroup}: ${record.exercise} (${record.weight} kg x ${record.repetitions} reps)`}
                    <button
                        onClick={() =>
                        confirmDeleteRecord(record.id, record.muscleGroup, record.exercise)
                        }
                    >
                        Eliminar
                    </button>
                    </li>
                );
                })}
            </ul>
            </section>
        </main>
        </div>
    );
    }

export default Historial;
