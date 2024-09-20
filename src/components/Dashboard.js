import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../Styles.css';
import './Dashboard.css'; // Importa los estilos específicos de Dashboard
import Dropdown from './Dropdown'; // Importa el componente Dropdown reutilizable

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

  const loadMuscleGroups = useCallback(async () => {
    if (!currentUser) return;

    const muscleGroupsRef = collection(db, 'muscleGroups');
    const userMuscleGroupsRef = query(collection(db, 'userMuscleGroups'), where('userId', '==', currentUser.uid));

    // Cargar los grupos predeterminados y personalizados
    const [nativeSnapshot, userSnapshot] = await Promise.all([getDocs(muscleGroupsRef), getDocs(userMuscleGroupsRef)]);

    const groups = [];

    // Agregar los grupos musculares predeterminados
    nativeSnapshot.forEach((doc) => {
      groups.push({ id: doc.id, isCustom: false });
    });

    // Agregar los grupos musculares personalizados
    userSnapshot.forEach((doc) => {
      groups.push({ id: doc.id.replace('Personalizado-', ''), isCustom: true });
    });

    setMuscleGroups(groups);
  }, [currentUser]);

  const loadExercises = useCallback(async (muscleGroup) => {
    if (!currentUser) return;

    const isCustomGroup = muscleGroups.find((group) => group.id === muscleGroup && group.isCustom);
    let combinedExercises = [];

    if (isCustomGroup) {
      // Cargar ejercicios personalizados para el usuario
      const userExercisesRef = query(
        collection(db, 'userExercises'),
        where('userId', '==', currentUser.uid),
        where('muscleGroup', '==', muscleGroup)
      );
      const userSnapshot = await getDocs(userExercisesRef);

      combinedExercises = userSnapshot.docs.map((doc) => doc.data().exercise);
    } else {
      // Cargar los ejercicios predeterminados
      const docRef = doc(db, 'muscleGroups', muscleGroup);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        combinedExercises = data.exercises || [];
      }

      // Cargar ejercicios personalizados añadidos por el usuario para este grupo predeterminado
      const userExercisesRef = query(
        collection(db, 'userExercises'),
        where('userId', '==', currentUser.uid),
        where('muscleGroup', '==', muscleGroup)
      );
      const userSnapshot = await getDocs(userExercisesRef);

      const customExercises = userSnapshot.docs.map((doc) => doc.data().exercise);
      combinedExercises = [...combinedExercises, ...customExercises];
    }

    setExercises(combinedExercises);
  }, [currentUser, muscleGroups]);

  useEffect(() => {
    const fetchData = async () => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          navigate('/');
        } else {
          setCurrentUser(user);
        }
      });
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      loadMuscleGroups();
    }

    // Restaurar los valores guardados en localStorage
    const savedGroup = localStorage.getItem('selectedGroup');
    const savedExercise = localStorage.getItem('selectedExercise');

    if (savedGroup) {
      setSelectedMuscleGroup(savedGroup);
      loadExercises(savedGroup); // Cargar los ejercicios cuando se restaura el grupo muscular
    }

    if (savedExercise) setSelectedExercise(savedExercise);
  }, [currentUser, loadMuscleGroups, loadExercises]);

  const handleMuscleGroupChange = async (value) => {
    setSelectedMuscleGroup(value);
    setSelectedExercise(''); // Restablecer la selección del ejercicio
    localStorage.setItem('selectedGroup', value); // Guardar el grupo muscular en localStorage
    localStorage.removeItem('selectedExercise'); // Eliminar el ejercicio seleccionado de localStorage
    loadExercises(value);
  };

  const handleExerciseChange = (value) => {
    setSelectedExercise(value);
    localStorage.setItem('selectedExercise', value); // Guardar el ejercicio en localStorage
  };

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
    <div className="dashboard-container card-container">
      <h1 className="dashboard-title">Registro de Ejercicios</h1>
      <div className="form-container">
        <label htmlFor="muscle-group">Grupo Muscular:</label>
        <Dropdown
          options={muscleGroups.map((group) => group.id)}
          selectedOption={selectedMuscleGroup}
          onSelect={handleMuscleGroupChange}
          placeholder="Selecciona un grupo muscular"
        />

        <label htmlFor="exercise">Ejercicio:</label>
        <Dropdown
          options={exercises}
          selectedOption={selectedExercise}
          onSelect={handleExerciseChange}
          placeholder="Selecciona un ejercicio"
          disabled={!selectedMuscleGroup} // Deshabilitar si no hay un grupo muscular seleccionado
        />

        <label htmlFor="weight">Peso (kg):</label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <label htmlFor="repetitions">Repeticiones:</label>
        <input
          type="number"
          id="repetitions"
          value={repetitions}
          onChange={(e) => setRepetitions(e.target.value)}
        />

        <label htmlFor="exercise-date">Fecha:</label>
        <input
          type="datetime-local"
          id="exercise-date"
          value={exerciseDate}
          onChange={(e) => setExerciseDate(e.target.value)}
        />

        <button className="save-button" onClick={handleSaveExercise}>
          Guardar Ejercicio
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
