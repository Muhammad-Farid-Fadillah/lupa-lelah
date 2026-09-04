import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Ganti dengan konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyCHGJG7S93saeNBt8aodD-2CDKPcBBObW0",
  authDomain: "lupalelah.firebaseapp.com",
  projectId: "lupalelah",
  storageBucket: "lupalelah.firebasestorage.app",
  messagingSenderId: "117935108191",
  appId: "1:117935108191:web:ee78d7b90e4586178cabea",
  measurementId: "G-TYDLW5ZV6R"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
