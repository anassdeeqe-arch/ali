import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedInitialData } from './lib/db';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

async function initApp() {
  // Test connection to Firestore
  try {
    await getDocFromServer(doc(db, '_test_', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }

  // Seed initial data if needed
  await seedInitialData();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

initApp();
