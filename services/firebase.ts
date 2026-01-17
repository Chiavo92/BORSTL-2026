import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAXYu61J43_aOcdDxqAd3tuls5V4ZiR-F8",
  authDomain: "bor-stl-base.firebaseapp.com",
  projectId: "bor-stl-base",
  storageBucket: "bor-stl-base.firebasestorage.app",
  messagingSenderId: "518757116768",
  appId: "1:518757116768:web:6950ba38e7201185314c05"
};

// Sprawdzamy czy klucze zostały podane (czy nie są domyślnymi placeholderami)
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "TWÓJ_API_KEY";

let db: any = null;
let rentalsCollection: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    rentalsCollection = collection(db, 'rentals');
  } catch (error) {
    console.error("Błąd inicjalizacji Firebase:", error);
  }
}

export { db, rentalsCollection };
