// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de tu aplicación Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCLoS55Jf1MaUzg7V5KoOOP1n4bxW7xlBs",
    authDomain: "gymapps-bd3ad.firebaseapp.com",
    projectId: "gymapps-bd3ad",
    storageBucket: "gymapps-bd3ad.appspot.com",
    messagingSenderId: "653716009114",
    appId: "1:653716009114:web:7cf8361b9f8439ba786f23",
    measurementId: "G-2RLTPR1LZR"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Proveedor para autenticación con Google
const provider = new GoogleAuthProvider();

export { auth, db, provider };
