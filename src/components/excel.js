import React from 'react';
import * as XLSX from 'xlsx';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

function ExcelExport() {
  const handleDownloadExcel = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Query para obtener los registros de ejercicios del usuario actual ordenados por fecha (lo más nuevo primero)
    const exerciseRecordsRef = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', user.uid),
      orderBy('dateTime', 'desc') // Ordena por fecha, de lo más nuevo a lo más antiguo
    );

    const snapshot = await getDocs(exerciseRecordsRef);

    // Procesar los datos para exportar a Excel
    const data = snapshot.docs.map((doc) => ({
      musculo: doc.data().muscleGroup,
      ejercicio: doc.data().exercise,
      peso: doc.data().weight,
      repeticiones: doc.data().repetitions,
      fecha: new Date(doc.data().dateTime).toLocaleString(), // Convertir la fecha a un formato legible
    }));

    if (data.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    // Crear un nuevo libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros de Ejercicios');

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, 'Registros_de_Ejercicios.xlsx');
  };

  return (
    <button onClick={handleDownloadExcel} className="excel-download-button">
      Descargar Registros en Excel
    </button>
  );
}

export default ExcelExport;
