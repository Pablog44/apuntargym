import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, limit, startAfter } from 'firebase/firestore'; // Importa 'limit' y 'startAfter'
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../Styles.css';
import './Historial.css'; // Importa los estilos específicos de Historial

function Historial() {
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [lastVisible, setLastVisible] = useState(null); // Almacena el último documento visible para la paginación
  const [isLoading, setIsLoading] = useState(false); // Manejamos el estado de carga
  const [hasMore, setHasMore] = useState(true); // Para saber si hay más registros para cargar
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          navigate('/');
        } else {
          loadInitialRecords(user.uid);
        }
      });
    };

    fetchData();
  }, [navigate]);

  // Cargar los primeros 25 registros
  const loadInitialRecords = async (userId) => {
    setIsLoading(true);
    const recordsQuery = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', userId),
      orderBy('dateTime', 'desc'),
      limit(25)
    );

    const snapshot = await getDocs(recordsQuery);
    const records = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Guardar el último documento visible
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

    setExerciseRecords(records);
    setLastVisible(lastVisibleDoc);
    setHasMore(snapshot.docs.length === 25); // Si cargamos menos de 25, no hay más registros
    setIsLoading(false);
  };

  // Cargar más registros
  const loadMoreRecords = async () => {
    if (!lastVisible) return;
    setIsLoading(true);

    const recordsQuery = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('dateTime', 'desc'),
      startAfter(lastVisible), // Empezar después del último registro cargado
      limit(25)
    );

    const snapshot = await getDocs(recordsQuery);
    const newRecords = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Guardar el último documento visible
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

    setExerciseRecords([...exerciseRecords, ...newRecords]);
    setLastVisible(lastVisibleDoc);
    setHasMore(snapshot.docs.length === 25); // Si cargamos menos de 25, no hay más registros
    setIsLoading(false);
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

  return (
    <div className="historial-container card-container">
      <header>
        <h1 className="historial-title">Historial de Ejercicios</h1>
      </header>
      <main>
        <section id="records-section">
          <ul className="records-list">
            {exerciseRecords.map((record) => {
              const formattedDateTime = new Date(record.dateTime).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <li key={record.id} className="record-item">
                  <div className="record-info">
                    <span className="record-date">{formattedDateTime}</span> - <span className="record-muscle-group">{record.muscleGroup}</span>: <span className="record-exercise">{record.exercise}</span> ({record.weight} kg x {record.repetitions} reps)
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => confirmDeleteRecord(record.id, record.muscleGroup, record.exercise)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="trash-icon"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6L17.5 18a2 2 0 01-2 1.8H8.5a2 2 0 01-2-1.8L5 6m4-3h6a2 2 0 012 2v1H7V5a2 2 0 012-2z" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
          {hasMore && !isLoading && (
            <button className="load-more-button" onClick={loadMoreRecords}>
              Cargar más
            </button>
          )}
          {isLoading && <p>Cargando...</p>}
        </section>
      </main>
    </div>
  );
}

export default Historial;
