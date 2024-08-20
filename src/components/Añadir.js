import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../Styles.css'; // Estilos generales
import './Añadir.css'; // Estilos específicos del componente

function Añadir() {
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [newMuscleGroup, setNewMuscleGroup] = useState('');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
    const [newExercise, setNewExercise] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
        if (!user) {
            navigate('/');
        } else {
            setCurrentUser(user);
            loadMuscleGroups(user.uid);
        }
        });
    }, [navigate]);

    const loadMuscleGroups = async (userId) => {
        const muscleGroupsRef = collection(db, 'muscleGroups');
        const userMuscleGroupsRef = query(collection(db, 'userMuscleGroups'), where('userId', '==', userId));

        const [nativeSnapshot, userSnapshot] = await Promise.all([getDocs(muscleGroupsRef), getDocs(userMuscleGroupsRef)]);

        const groups = [];

        nativeSnapshot.forEach((doc) => {
        groups.push(doc.id);
        });

        userSnapshot.forEach((doc) => {
        groups.push(doc.id.replace('Personalizado-', '') + ' (Personalizado)');
        });

        setMuscleGroups(groups);
    };

    const handleAddMuscleGroup = async () => {
        if (newMuscleGroup.trim() && currentUser) {
        const newGroupRef = doc(db, 'userMuscleGroups', `Personalizado-${newMuscleGroup.trim()}`);
        await setDoc(newGroupRef, {
            userId: currentUser.uid,
            exercises: [],
        });
        setNewMuscleGroup('');
        loadMuscleGroups(currentUser.uid);
        }
    };

    const handleAddExercise = async () => {
        if (newExercise.trim() && selectedMuscleGroup) {
        const isCustomGroup = selectedMuscleGroup.includes(' (Personalizado)');
        const muscleGroupName = selectedMuscleGroup.replace(' (Personalizado)', '');

        const userExerciseRef = collection(db, 'userExercises');

        await addDoc(userExerciseRef, {
            userId: currentUser.uid,
            muscleGroup: muscleGroupName,
            exercise: newExercise.trim(),
            isCustomGroup,
        });

        setNewExercise('');
        }
    };

    return (
        <div className="añadir-container card-container">
        <header>
            <h1 className="añadir-title">Personalizar Grupos y Ejercicios</h1>
        </header>
        <main>
            <section id="custom-section" className="form-container">
            <h2>Añadir Nuevos Grupos/Ejercicios</h2>
            <label htmlFor="new-muscle-group">Nuevo Grupo Muscular:</label>
            <input
                type="text"
                id="new-muscle-group"
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
            />
            <button onClick={handleAddMuscleGroup}>Añadir Grupo Muscular</button>

            <label htmlFor="muscle-group-select">Seleccionar Grupo Muscular:</label>
            <select
                id="muscle-group-select"
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            >
                <option value="">Selecciona un grupo muscular</option>
                {muscleGroups.map((group) => (
                <option key={group} value={group}>
                    {group}
                </option>
                ))}
            </select>

            <label htmlFor="new-exercise">Nuevo Ejercicio:</label>
            <input
                type="text"
                id="new-exercise"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
            />
            <button onClick={handleAddExercise}>Añadir Ejercicio</button>
            </section>
        </main>
        </div>
    );
    }

export default Añadir;
