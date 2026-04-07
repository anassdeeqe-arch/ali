import { db } from './src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function checkDoc() {
  const docRef = doc(db, 'analytics', 'main');
  const snap = await getDoc(docRef);
  console.log("Analytics doc:", snap.data());
}

checkDoc();
