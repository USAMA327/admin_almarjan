// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5y4pwbqRzHZy2ScBfVmMqvg5qvqQZRyU",
  authDomain: "al-marjan-74559.firebaseapp.com",
  projectId: "al-marjan-74559",
  storageBucket: "al-marjan-74559.firebasestorage.app",
  messagingSenderId: "267411467448",
  appId: "1:267411467448:web:6d7d454a8b05b43781184d"
  
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);