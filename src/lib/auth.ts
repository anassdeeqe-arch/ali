import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

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

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const isAdmin = await verifyAdmin(result.user);
    
    if (!isAdmin) {
      await signOut(auth);
      throw new Error("Access denied. Your email is not registered as an admin.");
    }
    
    return result.user;
  } catch (error) {
    console.error('Google Login Error:', error);
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
