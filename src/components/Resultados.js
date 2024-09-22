import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown'; // Importa el nuevo componente Dropdown
import '../Styles.css';
import './Resultados.css';

function Resultados() {
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sortCriteria, setSortCriteria] = useState('dateTime');

  const [lastVisible, setLastVisible] = useState(null);
  const [allRecordsLoaded, setAllRecordsLoaded] = useState(false);

  const navigate = useNavigate();

  // Mapa de traducción de criterios de ordenación
  const criteriaMap = {
    weight: 'Peso',
    repetitions: 'Repeticiones',
    dateTime: 'Fecha',
    PR: 'PR'
  };

  const reverseCriteriaMap = {
    Peso: 'weight',
    Repeticiones: 'repetitions',
    Fecha: 'dateTime',
    PR: 'PR'
  };

  useEffect(() => {
    const fetchData = async () => {
      auth.onAuthStateChanged((user) => {
        if (!user) {
          navigate('/');
        } else {
          loadExerciseRecords(user.uid);
        }
      });
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    // Cargar los filtros guardados de localStorage al cargar la página
    const savedGroup = localStorage.getItem('selectedGroup');
    const savedExercise = localStorage.getItem('selectedExercise');
    const savedSortCriteria = localStorage.getItem('sortCriteria');

    if (savedGroup) setSelectedGroup(savedGroup);
    if (savedExercise) setSelectedExercise(savedExercise);
    if (savedSortCriteria) setSortCriteria(savedSortCriteria);
  }, []);

  const loadExerciseRecords = async (userId, lastDoc = null) => {
    // Cargar todos los registros para obtener los grupos musculares y ejercicios
    const allRecordsQuery = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', userId)
    );

    const allSnapshot = await getDocs(allRecordsQuery);
    const allRecords = allSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setExerciseRecords(allRecords);

    // Cargar registros limitados para mostrar
    let recordsQuery = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', userId),
      orderBy('dateTime', 'desc'),
      limit(10)
    );

    if (lastDoc) {
      recordsQuery = query(
        collection(db, 'exerciseRecords'),
        where('userId', '==', userId),
        orderBy('dateTime', 'desc'),
        startAfter(lastDoc),
        limit(10)
      );
    }

    const snapshot = await getDocs(recordsQuery);
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (snapshot.docs.length < 10) {
      setAllRecordsLoaded(true);
    } else {
      setAllRecordsLoaded(false);
    }

    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

    if (lastDoc) {
      setFilteredRecords((prev) => [...prev, ...records]);
    } else {
      setFilteredRecords(records);
    }
  };

  const sortAndDisplayResults = useCallback(
    (records) => {
      let sortedRecords;

      if (sortCriteria === 'PR') {
        const groupedByExercise = records.reduce((acc, record) => {
          const key = `${record.exercise}-${record.weight}`;
          if (!acc[key] || acc[key].repetitions < record.repetitions) {
            acc[key] = record;
          }
          return acc;
        }, {});

        sortedRecords = Object.values(groupedByExercise).sort((a, b) => b.weight - a.weight);
      } else {
        sortedRecords = [...records].sort((a, b) => {
          if (sortCriteria === 'dateTime') {
            return new Date(b.dateTime) - new Date(a.dateTime);
          } else if (sortCriteria === 'weight') {
            if (b.weight === a.weight) {
              return b.repetitions - a.repetitions; // Ordena por repeticiones si el peso es el mismo
            }
            return b.weight - a.weight; // Ordena por peso de mayor a menor
          } else if (sortCriteria === 'repetitions') {
            return b.repetitions - a.repetitions;
          }
          return 0;
        });
      }

      setFilteredRecords(sortedRecords);
    },
    [sortCriteria]
  );

  const applyFilters = useCallback(() => {
    let filtered = exerciseRecords;

    if (selectedGroup) {
      filtered = filtered.filter((record) => record.muscleGroup === selectedGroup);
    }
    if (selectedExercise) {
      filtered = filtered.filter((record) => record.exercise === selectedExercise);
    }

    sortAndDisplayResults(filtered);
  }, [exerciseRecords, selectedGroup, selectedExercise, sortAndDisplayResults]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (group, exercise = '') => {
    setSelectedGroup(group);
    setSelectedExercise(''); // Al cambiar el grupo muscular, se deselecciona el ejercicio
    localStorage.setItem('selectedGroup', group);
    localStorage.removeItem('selectedExercise'); // Eliminar el ejercicio seleccionado de localStorage
  };

  const handleExerciseChange = (exercise) => {
    setSelectedExercise(exercise);
    localStorage.setItem('selectedExercise', exercise); // Guardar el ejercicio seleccionado en localStorage
  };

  const handleSortChange = (criteria) => {
    setSortCriteria(criteria);
    localStorage.setItem('sortCriteria', criteria); // Guardar el criterio de ordenación en localStorage
  };

  const loadMoreRecords = () => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        loadExerciseRecords(user.uid, lastVisible);
      }
    });
  };

  return (
    <div className="resultados-container card-container">
      <h1 className="resultados-title">Resultados</h1>
      <div className="form-container">

        <label htmlFor="filter-muscle-group">Grupo Muscular:</label>
        <Dropdown
          options={[...new Set(exerciseRecords.map((record) => record.muscleGroup))]}
          selectedOption={selectedGroup}
          onSelect={(group) => handleFilterChange(group)} // Al cambiar grupo, se actualiza y deselecciona el ejercicio
          placeholder="Todos"
        />

        <label htmlFor="filter-exercise">Ejercicio:</label>
        <Dropdown
          options={exerciseRecords
            .filter((record) => record.muscleGroup === selectedGroup)
            .map((record) => record.exercise)
            .filter((exercise, index, self) => self.indexOf(exercise) === index)}
          selectedOption={selectedExercise}
          onSelect={(exercise) => handleExerciseChange(exercise)} // Solo cambiamos el ejercicio
          placeholder="Todos"
          disabled={!selectedGroup}
        />

        <button className="apply-button" onClick={applyFilters}>Aplicar Filtros</button>

        <h2>Ordenar Resultados</h2>
        <label htmlFor="sort-criteria">Criterio:</label>
        <Dropdown
          options={['Peso', 'Repeticiones', 'Fecha', 'PR']}
          selectedOption={criteriaMap[sortCriteria]} // Mostramos la opción en español
          onSelect={(option) => {
            const translatedCriteria = reverseCriteriaMap[option];
            handleSortChange(translatedCriteria); // Actualizamos el criterio de ordenación y lo guardamos en localStorage
          }}
          placeholder="Peso"
        />
      </div>
      <ul className="results-list">
        {filteredRecords.length === 0 ? (
          <li className="no-results">No se encontraron resultados.</li>
        ) : (
          filteredRecords.map((record) => (
            <li key={record.id} className="record-item">
              <div className="record-info">
                <span className="record-date">{new Date(record.dateTime).toLocaleString()}</span> -{' '}
                <span className="record-muscle-group">{record.muscleGroup}</span>:{' '}
                <span className="record-exercise">{record.exercise}</span> ({record.weight} kg x{' '}
                {record.repetitions} reps)
              </div>
            </li>
          ))
        )}
      </ul>
      {!allRecordsLoaded && (
        <button className="load-more-button" onClick={loadMoreRecords}>
          Cargar más
        </button>
      )}
    </div>
  );
}

export default Resultados;
