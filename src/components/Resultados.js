import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../Styles.css';
import './Resultados.css';

function Resultados() {
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sortCriteria, setSortCriteria] = useState('dateTime');
  const navigate = useNavigate();

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

  const loadExerciseRecords = async (userId) => {
    const recordsQuery = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(recordsQuery);
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setExerciseRecords(records);
    setFilteredRecords(records);
  };

  const sortAndDisplayResults = useCallback(
    (records) => {
      const sortedRecords = [...records].sort((a, b) => {
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

  return (
    <div className="resultados-container card-container">
      <h1 className="resultados-title">Resultados</h1>
      <div className="form-container">
      <label htmlFor="filter-muscle-group">Grupo Muscular:</label>
      <select
        id="filter-muscle-group"
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
      >
        <option value="">Todos</option>
        {[...new Set(exerciseRecords.map((record) => record.muscleGroup))].map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      <label htmlFor="filter-exercise">Ejercicio:</label>
      <select
        id="filter-exercise"
        value={selectedExercise}
        onChange={(e) => setSelectedExercise(e.target.value)}
        disabled={!selectedGroup}
      >
        <option value="">Todos</option>
        {exerciseRecords
          .filter((record) => record.muscleGroup === selectedGroup)
          .map((record) => record.exercise)
          .filter((exercise, index, self) => self.indexOf(exercise) === index)
          .map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
      </select>

      <button className="apply-button" onClick={applyFilters}>Aplicar Filtros</button>

      <h2>Ordenar Resultados</h2>
      <label htmlFor="sort-criteria">Criterio:</label>
      <select
        id="sort-criteria"
        value={sortCriteria}
        onChange={(e) => setSortCriteria(e.target.value)}
      >
        <option value="weight">Peso</option>
        <option value="repetitions">Repeticiones</option>
        <option value="dateTime">Fecha</option>
      </select>
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
    </div>
  );
}

export default Resultados;
