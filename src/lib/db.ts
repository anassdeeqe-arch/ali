import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  increment,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { BlogPost, WebsiteSettings, Analytics } from '../types';

// Error Handling Spec for Firestore Operations
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Initial Seeding ---
export const seedInitialData = async () => {
  try {
    // Check if settings exist
    const settingsRef = doc(db, 'settings', 'main');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      const defaultSettings: WebsiteSettings = {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        pinterest: 'https://pinterest.com',
        youtube: 'https://youtube.com',
        editorName: 'Fashion Editor',
        editorBio: 'Passionate about style and elegance.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        websiteLogo: '',
        footerText: 'Your daily dose of fashion inspiration and style guides.'
      };
      await setDoc(settingsRef, defaultSettings);
      console.log('Default settings seeded.');
    }

    // Check if analytics exist
    const analyticsRef = doc(db, 'analytics', 'main');
    const analyticsSnap = await getDoc(analyticsRef);
    if (!analyticsSnap.exists()) {
      await setDoc(analyticsRef, { 
        pageViews: 0, 
        totalPageViews: 0,
        dailyStats: []
      });
      console.log('Default analytics seeded.');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

// --- Blog Posts ---
export const getPosts = async (): Promise<BlogPost[]> => {
  const path = 'posts';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getPost = async (id: string): Promise<BlogPost | null> => {
  const path = `posts/${id}`;
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const addPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
  const path = 'posts';
  try {
    return await addDoc(collection(db, path), {
      ...post,
      createdAt: serverTimestamp(),
      views: 0
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updatePost = async (id: string, data: Partial<BlogPost>) => {
  const path = `posts/${id}`;
  try {
    const docRef = doc(db, 'posts', id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deletePost = async (id: string) => {
  const path = `posts/${id}`;
  try {
    await deleteDoc(doc(db, 'posts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// --- Users ---
export const getUsers = async () => {
  const path = 'users';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteUserDoc = async (id: string) => {
  const path = `users/${id}`;
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// --- Settings ---
export const getSettings = async (): Promise<WebsiteSettings | null> => {
  const path = 'settings/main';
  try {
    const docRef = doc(db, 'settings', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as WebsiteSettings;
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn('Could not load settings: Missing permissions.');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateSettings = async (data: Partial<WebsiteSettings>) => {
  const path = 'settings/main';
  try {
    const docRef = doc(db, 'settings', 'main');
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// --- Analytics ---
export const getAnalytics = async (): Promise<Analytics | null> => {
  const path = 'analytics/main';
  try {
    const docRef = doc(db, 'analytics', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Analytics;
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn('Could not load analytics: Missing permissions.');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const trackPageView = async () => {
  const path = 'analytics/main';
  try {
    const docRef = doc(db, 'analytics', 'main');
    const today = new Date().toISOString().split('T')[0];
    
    const snap = await getDoc(docRef);
    const data = snap.data() as Analytics;
    let dailyStats = data?.dailyStats || [];
    
    const todayIndex = dailyStats.findIndex(s => s.date === today);
    if (todayIndex >= 0) {
      dailyStats[todayIndex].views += 1;
    } else {
      dailyStats.push({ date: today, views: 1 });
      // Keep only last 30 days
      if (dailyStats.length > 30) dailyStats.shift();
    }

    await setDoc(docRef, { 
      pageViews: increment(1),
      totalPageViews: increment(1),
      dailyStats 
    }, { merge: true });
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn('Analytics tracking skipped: Missing permissions. Please update Firestore rules.');
    } else {
      console.error('Analytics tracking error:', error);
    }
  }
};

export const trackPostView = async (postId: string) => {
  const path = `posts/${postId}`;
  try {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, { views: increment(1) });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
