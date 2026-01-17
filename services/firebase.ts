
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, CollectionReference, Firestore, DocumentData } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXYu61J43_aOcdDxqAd3tuls5V4ZiR-F8",
  authDomain: "bor-stl-base.firebaseapp.com",
  projectId: "bor-stl-base",
  storageBucket: "bor-stl-base.firebasestorage.app",
  messagingSenderId: "518757116768",
  appId: "1:518757116768:web:6950ba38e7201185314c05"
};

// Sprawdzamy czy klucze zostały podane
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "TWÓJ_API_KEY";

let db: Firestore | null = null;
let rentalsCollection: CollectionReference<DocumentData> | null = null;

if (isFirebaseConfigured) {
  try {
    const app: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(app);
    rentalsCollection = collection(db, 'rentals');
  } catch (error) {
    console.error("Błąd inicjalizacji Firebase:", error);
  }
}

export { db, rentalsCollection };
