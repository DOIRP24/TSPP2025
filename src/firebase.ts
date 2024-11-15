import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBplTHP3_sSh0Lz30sKfpv7ruI9vo1jITc",
  authDomain: "vrerbvrbv.firebaseapp.com",
  databaseURL: "https://vrerbvrbv-default-rtdb.firebaseio.com",
  projectId: "vrerbvrbv",
  storageBucket: "vrerbvrbv.firebasestorage.app",
  messagingSenderId: "857127959442",
  appId: "1:857127959442:web:999c981f821b7d21c55f4b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Sign in anonymously when the app starts
signInAnonymously(auth).catch((error) => {
  console.error("Error signing in anonymously:", error);
});