import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmW1OrDnaGu7bLCkClRgEjb7C7_6E6W24",
  authDomain: "login-paste.arexans.biz.id",
  projectId: "pastexans",
  storageBucket: "pastexans.firebasestorage.app",
  messagingSenderId: "778487862774",
  appId: "1:778487862774:web:e2a118313c7b22dcab23d7",
  measurementId: "G-2VS4GWJ2M8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const appId = 'sharexans-v2';
