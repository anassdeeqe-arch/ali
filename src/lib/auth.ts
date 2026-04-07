import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User,
  getAuth
} from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { auth, db } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export const verifyAdmin = async (user: User) => {
  const allowedEmails = ["anassdeeqe@gmail.com", "salmabibi7867868@gmail.com"];
  if (user.email && allowedEmails.includes(user.email)) {
    return true;
  }
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      return true;
    }
  } catch (error) {
    console.error("Error verifying admin:", error);
  }
  return false;
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const isAdmin = await verifyAdmin(result.user);
    
    if (!isAdmin) {
      await signOut(auth);
      throw new Error("Access denied. Your email is not registered as an admin.");
    }
    
    return result.user;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const createAdminUser = async (email: string, password: string, name: string) => {
  // We use a secondary app instance to create the user so it doesn't log out the current admin
  const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    
    // Save user role in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      name: name,
      role: 'admin',
      createdAt: new Date()
    });
    
    // Sign out the secondary app so it doesn't persist
    await signOut(secondaryAuth);
    
    return result.user;
  } catch (error) {
    console.error('Create User Error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
