import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "budgetnest-7a2e6.firebaseapp.com",
  projectId: "budgetnest-7a2e6",
  storageBucket: "budgetnest-7a2e6.appspot.com", // ✅ fixed
  messagingSenderId: "684756287889",
  appId: "1:684756287889:web:f4fd5b2fd965e41b365a30",
  measurementId: "G-VJ2QQ2JZ0E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
