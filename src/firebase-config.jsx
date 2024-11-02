// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCw-2mayudsznQPVkNecbCJRjkXGD-38PE",
  authDomain: "cashmere-studio.firebaseapp.com",
  projectId: "cashmere-studio",
  storageBucket: "cashmere-studio.appspot.com",
  messagingSenderId: "938836982232",
  appId: "1:938836982232:web:02eabef97a0b135ef51aad",
  measurementId: "G-5R03RVTX7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);  // Inizializza Firestore
const auth = getAuth(app);
const storage = getStorage(app);

// Esporta l'istanza di Firestore se necessario
export  { db, auth, storage, ref, getDownloadURL };

