// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  UserCredential,
  User,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirebaseErrorMessage } from "./firebaseErrorText";
import toast from "react-hot-toast";
import { deleteCookie } from "cookies-next";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
const firebaseConfig = {
  apiKey: "AIzaSyA5y4pwbqRzHZy2ScBfVmMqvg5qvqQZRyU",
  authDomain: "al-marjan-74559.firebaseapp.com",
  projectId: "al-marjan-74559",
  storageBucket: "al-marjan-74559.firebasestorage.app",
  messagingSenderId: "267411467448",
  appId: "1:267411467448:web:6d7d454a8b05b43781184d"
  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



// Set persistence (optional, as 'local' is the default)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword };

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    // Sign in with Google
    const result: UserCredential = await signInWithPopup(auth, googleProvider);

    // Get the ID token result to access custom claims
    const idTokenResult = await result.user.getIdTokenResult();

    // Access the custom claim (role)
    const role = idTokenResult.claims.role;

    // Check if the user has the 'admin' role
    if (role === "admin") {
      return result.user; // Return the user if they are an admin
    } else {
      toast.error("You do not have access to login!"); // Show error if the user is not an admin
      await auth.signOut(); // Sign out the user if they don't have the required role
      return null;
    }
  } catch (error) {
    // Handle errors
    const errorMessage = getFirebaseErrorMessage((error as any).code);
    toast.error(errorMessage);
    console.error("Google Sign-In Error:", (error as Error).message);
    return null;
  }
};


export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    // Sign in with email and password
    const result: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get the ID token result to access custom claims
    const idTokenResult = await result.user.getIdTokenResult();

    // Access the custom claim (role)
    const role = idTokenResult.claims.role;

    // Check if the user has the 'admin' role
    if (role === "admin") {
      return result.user; // Return the user if they are an admin
    } else {
      toast.error("You do not have access to login!"); // Show error if the user is not an admin
      await auth.signOut(); // Sign out the user if they don't have the required role
      return null;
    }
  } catch (error) {
    // Handle errors
    const errorMessage = getFirebaseErrorMessage((error as any).code);
    toast.error(errorMessage);
    console.error("Email/Password Sign-In Error:", (error as Error).message);
    return null;
  }
};


export const signOutUser = async (router: AppRouterInstance): Promise<void> => {
  try {
    await signOut(auth);
    toast.success("User signed out successfully");
    deleteCookie("token");
    router.push("/signin"); // Redirect using passed router instance
  } catch (error) {
    const errorMessage = (error as any).message || "Sign-out failed";
    toast.error(errorMessage);
    console.error("Sign-Out Error:", errorMessage);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};


