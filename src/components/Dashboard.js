// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../Styles.css';

function Dashboard() {
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
    const [selectedExercise, setSelectedExercise] = useState('');
    const [weight, setWeight] = useState('');
    const [repetitions, setRepetitions] = useState('');
    const [exerciseDate, setExerciseDate] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
            navigate('/');
            } else {
            setCurrentUser(user);
            loadMuscleGroups(); // Aquí se llama la función definida globalmente
            }
        });
        };

        fetchData();
    }, [navigate]);

    const loadMuscleGroups = async () => {
        const muscleGroupsRef = collection(db, 'muscleGroups');
        const snapshot = await getDocs(muscleGroupsRef);

        if (snapshot.empty) {
        await initializeDefaultMuscleGroups();
        }

        const groups = snapshot.docs.map(doc => doc.id);
        setMuscleGroups(groups);
    };

    const initializeDefaultMuscleGroups = async () => {
        const defaultGroups = {
        Pecho: ['Press Banca', 'Press Inclinado', 'Aperturas'],
        Espalda: ['Dominadas', 'Remo con Barra', 'Jalón al Pecho'],
        Brazos: ['Curl con Barra', 'Tríceps Fondo', 'Martillo'],
        Piernas: ['Sentadilla', 'Prensa', 'Peso Muerto'],
        Hombros: ['Press Militar', 'Elevaciones Laterales', 'Pájaro'],
        };

        for (const [group, exercises] of Object.entries(defaultGroups)) {
        await setDoc(doc(db, 'muscleGroups', group), { exercises });
        }

        // Recarga los grupos musculares después de inicializarlos
        loadMuscleGroups();
    };

    const handleMuscleGroupChange = (e) => {
        setSelectedMuscleGroup(e.target.value);
        loadExercises(e.target.value);
    };

    const loadExercises = async (muscleGroup) => {
        const docRef = doc(db, 'muscleGroups', muscleGroup);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
        const data = docSnap.data();
        setExercises(data.exercises || []);
        } else {
        console.log(`No se encontraron ejercicios para el grupo muscular: ${muscleGroup}`);
        }
    };

    const handleSaveExercise = async () => {
        if (currentUser && selectedMuscleGroup && selectedExercise && weight && repetitions && exerciseDate) {
        await addDoc(collection(db, 'exerciseRecords'), {
            userId: currentUser.uid,
            muscleGroup: selectedMuscleGroup,
            exercise: selectedExercise,
            weight: Number(weight),
            repetitions: Number(repetitions),
            dateTime: new Date(exerciseDate).toISOString(),
        });
        alert('Ejercicio guardado correctamente');
        } else {
        alert('Por favor, completa todos los campos.');
        }
    };

    return (
        <div>
        <h1>Registro de Ejercicios</h1>
        <div className="form-container">
            <label htmlFor="muscle-group">Grupo Muscular:</label>
            <select id="muscle-group" value={selectedMuscleGroup} onChange={handleMuscleGroupChange}>
            <option value="">Selecciona un grupo muscular</option>
            {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
            ))}
            </select>
            <label htmlFor="exercise">Ejercicio:</label>
            <select id="exercise" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
            <option value="">Selecciona un ejercicio</option>
            {exercises.map(exercise => (
                <option key={exercise} value={exercise}>{exercise}</option>
            ))}
            </select>
            <label htmlFor="weight">Peso (kg):</label>
            <input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <label htmlFor="repetitions">Repeticiones:</label>
            <input type="number" id="repetitions" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} />
            <label htmlFor="exercise-date">Fecha:</label>
            <input type="datetime-local" id="exercise-date" value={exerciseDate} onChange={(e) => setExerciseDate(e.target.value)} />
            <button onClick={handleSaveExercise}>Guardar Ejercicio</button>
        </div>
        </div>
    );
    }

export default Dashboard;
