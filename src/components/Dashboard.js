import React, { useState, useEffect, useCallback } from 'react';
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

  // Mueve initializeDefaultMuscleGroups fuera de los hooks de React
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

    loadMuscleGroups(); // Recarga los grupos musculares después de inicializarlos
  };

  const loadMuscleGroups = useCallback(async () => {
    const muscleGroupsRef = collection(db, 'muscleGroups');
    const snapshot = await getDocs(muscleGroupsRef);

    if (snapshot.empty) {
      await initializeDefaultMuscleGroups(); // Solo inicializa si está vacío
    } else {
      const groups = snapshot.docs.map((doc) => doc.id);
      setMuscleGroups(groups);
    }
  }, []); // Ahora este hook no depende de funciones externas

  useEffect(() => {
    const fetchData = async () => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          navigate('/');
        } else {
          setCurrentUser(user);
          loadMuscleGroups(); // Carga los grupos musculares cuando se autentica
        }
      });
    };

    fetchData();
  }, [navigate, loadMuscleGroups]);

  const handleMuscleGroupChange = (e) => {
    setSelectedMuscleGroup(e.target.value);
    loadExercises(e.target.value);
  };

  const loadExercises = useCallback(async (muscleGroup) => {
    const docRef = doc(db, 'muscleGroups', muscleGroup);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setExercises(data.exercises || []);
    } else {
      console.log(`No se encontraron ejercicios para el grupo muscular: ${muscleGroup}`);
    }
  }, []);

  const handleSaveExercise = async () => {
    if (currentUser && selectedMuscleGroup && selectedExercise && weight && repetitions) {
      const dateTime = exerciseDate
        ? new Date(exerciseDate).toISOString()
        : new Date().toISOString(); // Si no se selecciona una fecha, usar la fecha actual en formato ISO

      await addDoc(collection(db, 'exerciseRecords'), {
        userId: currentUser.uid,
        muscleGroup: selectedMuscleGroup,
        exercise: selectedExercise,
        weight: Number(weight),
        repetitions: Number(repetitions),
        dateTime,
      });
      alert('Ejercicio guardado correctamente');
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Registro de Ejercicios</h1>
      <div className="form-container">
        <label htmlFor="muscle-group">Grupo Muscular:</label>
        <select id="muscle-group" value={selectedMuscleGroup} onChange={handleMuscleGroupChange}>
          <option value="">Selecciona un grupo muscular</option>
          {muscleGroups.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
        <label htmlFor="exercise">Ejercicio:</label>
        <select id="exercise" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
          <option value="">Selecciona un ejercicio</option>
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
        <label htmlFor="weight">Peso (kg):</label>
        <input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <label htmlFor="repetitions">Repeticiones:</label>
        <input type="number" id="repetitions" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} />
        <label htmlFor="exercise-date">Fecha:</label>
        <input type="datetime-local" id="exercise-date" value={exerciseDate} onChange={(e) => setExerciseDate(e.target.value)} />
        <button className="save-button" onClick={handleSaveExercise}>Guardar Ejercicio</button>
      </div>
    </div>
  );
}

export default Dashboard;
