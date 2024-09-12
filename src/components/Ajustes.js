import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../Styles.css';
import './Ajustes.css'; // Importa los estilos específicos de Ajustes
import ExcelExport from './excel'
import { useTheme } from './ThemeContext';

function Ajustes() {
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      } else {
        setCurrentUser(user);
        initializeMuscleGroups(user.uid);
      }
    });
  }, [navigate]);

  const initializeMuscleGroups = async (userId) => {
    const userMuscleGroupsRef = query(collection(db, 'userMuscleGroups'), where('userId', '==', userId));
    const userExercisesRef = query(collection(db, 'userExercises'), where('userId', '==', userId));

    try {
      const [userMuscleGroupsSnapshot, userExercisesSnapshot] = await Promise.all([
        getDocs(userMuscleGroupsRef),
        getDocs(userExercisesRef),
      ]);

      const groups = [];

      // Agregar grupos musculares predeterminados si tienen ejercicios personalizados
      userExercisesSnapshot.forEach((doc) => {
        const muscleGroup = doc.data().muscleGroup;
        // Evitar agregar duplicados, manteniendo el último en caso de duplicación
        const groupIndex = groups.findIndex((group) => group.id === muscleGroup);
        if (groupIndex === -1) {
          groups.push({
            id: muscleGroup,
            isCustom: false,
          });
        } else {
          groups[groupIndex] = {
            id: muscleGroup,
            isCustom: false,
          }; // Reemplaza con el último que encuentre
        }
      });

      // Agregar grupos musculares personalizados del usuario
      userMuscleGroupsSnapshot.forEach((doc) => {
        const muscleGroupId = doc.id.replace('Personalizado-', '');
        const groupIndex = groups.findIndex((group) => group.id === muscleGroupId);
        if (groupIndex === -1) {
          groups.push({
            id: muscleGroupId,
            isCustom: true,
          });
        } else {
          groups[groupIndex] = {
            id: muscleGroupId,
            isCustom: true,
          }; // Reemplaza con el último que encuentre
        }
      });

      // Eliminar duplicados y mantener el último duplicado (el que sale más abajo)
      const uniqueGroups = Array.from(new Set(groups.map((group) => group.id)))
        .map((id) => groups[groups.map((group) => group.id).lastIndexOf(id)]);

      setMuscleGroups(uniqueGroups);
    } catch (error) {
      console.error('Error cargando grupos musculares:', error);
      setDebugInfo(`Error cargando grupos musculares: ${error}`);
    }
  };

  const updateExerciseOptions = useCallback(async () => {
    if (!selectedMuscleGroup) return;

    const muscleGroupName = selectedMuscleGroup.replace(' (Personalizado)', '').replace('Personalizado-', '');
    const userExercisesRef = query(
      collection(db, 'userExercises'),
      where('userId', '==', currentUser.uid),
      where('muscleGroup', '==', muscleGroupName)
    );

    try {
      const snapshot = await getDocs(userExercisesRef);
      const exercisesList = [];

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          exercisesList.push(doc.data().exercise);
        });
      } else {
        setDebugInfo(`No se encontraron ejercicios personalizados para el grupo ${muscleGroupName}.`);
      }

      setExercises(exercisesList);
    } catch (error) {
      console.error('Error cargando ejercicios personalizados:', error);
      setDebugInfo(`Error cargando ejercicios personalizados: ${error}`);
    }
  }, [selectedMuscleGroup, currentUser]);

  const handleDeleteMuscleGroup = async () => {
    const muscleGroupName = selectedMuscleGroup.replace(' (Personalizado)', '').replace('Personalizado-', '');
    const groupRef = doc(db, 'userMuscleGroups', `Personalizado-${muscleGroupName}`);

    if (window.confirm(`¿Estás seguro de que deseas eliminar el grupo muscular ${muscleGroupName}?`)) {
      try {
        await deleteDoc(groupRef);
        setDebugInfo(`Grupo muscular ${muscleGroupName} eliminado.`);
        initializeMuscleGroups(currentUser.uid);
        setSelectedMuscleGroup(''); // Restablecer selección
        setExercises([]); // Limpiar ejercicios
      } catch (error) {
        console.error(`Error eliminando el grupo muscular ${muscleGroupName}:`, error);
        setDebugInfo(`Error eliminando el grupo muscular ${muscleGroupName}: ${error}`);
      }
    }
  };

  const handleDeleteExercise = async () => {
    const exerciseName = selectedExercise;
    const muscleGroupName = selectedMuscleGroup.replace(' (Personalizado)', '').replace('Personalizado-', '');
    const userExercisesRef = query(
      collection(db, 'userExercises'),
      where('userId', '==', currentUser.uid),
      where('muscleGroup', '==', muscleGroupName),
      where('exercise', '==', exerciseName)
    );

    if (window.confirm(`¿Estás seguro de que deseas eliminar el ejercicio ${exerciseName} del grupo muscular ${muscleGroupName}?`)) {
      try {
        const snapshot = await getDocs(userExercisesRef);
        if (!snapshot.empty) {
          snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
            setDebugInfo(`Ejercicio ${exerciseName} eliminado del grupo muscular ${muscleGroupName}.`);
            updateExerciseOptions();
            setSelectedExercise(''); // Restablecer selección
          });
        } else {
          setDebugInfo(`No se encontró el ejercicio ${exerciseName} en el grupo muscular ${muscleGroupName}.`);
        }
      } catch (error) {
        console.error(`Error eliminando el ejercicio ${exerciseName}:`, error);
        setDebugInfo(`Error eliminando el ejercicio ${exerciseName}: ${error}`);
      }
    }
  };

  useEffect(() => {
    if (selectedMuscleGroup) {
      updateExerciseOptions();
    }
  }, [selectedMuscleGroup, updateExerciseOptions]);


  return (
    <div className="ajustes-container card-container">
      <header>
        <h1 className="ajustes-title">Ajustes</h1>
      </header>
      <main>
        <section id="delete-section" className="form-container">
          <button onClick={toggleTheme} className="theme-toggle-button">
            Cambiar a {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <ExcelExport />
          <h2>Eliminar Grupos/Ejercicios</h2>
          <label htmlFor="muscle-group">Grupo Muscular:</label>
          <select
            id="muscle-group"
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          >
            <option value="">Selecciona un grupo muscular</option>
            {muscleGroups.map((group) => (
              <option key={group.id} value={group.id + (group.isCustom ? ' (Personalizado)' : '')}>
                {group.id} {group.isCustom ? '(Personalizado)' : ''}
              </option>
            ))}
          </select>
          <label htmlFor="exercise">Ejercicio:</label>
          <select
            id="exercise"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            disabled={!selectedMuscleGroup}
          >
            <option value="">Selecciona un ejercicio</option>
            {exercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
          <button id="delete-muscle-group" onClick={handleDeleteMuscleGroup} disabled={!selectedMuscleGroup || !selectedMuscleGroup.includes('(Personalizado)')}>
            Eliminar Grupo Muscular
          </button>
          <button id="delete-exercise" onClick={handleDeleteExercise} disabled={!selectedExercise}>
            Eliminar Ejercicio
          </button>
        </section>
        <div id="debug-info">{debugInfo}</div>
      </main>
    </div>
  );
}

export default Ajustes;
