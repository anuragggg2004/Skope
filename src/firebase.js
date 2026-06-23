import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration – values read from Vite env variables (set in .env locally, and in Render dashboard for production)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'YOUR_PROJECT.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || 'YOUR_APP_ID',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || undefined,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export authentication utilities
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add prompt to force account selection (fixes silent re-login issues)
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Export Analytics — only initialize if supported in this environment (avoids crashes in SSR / blocked environments)
export let analytics = null;
isSupported().then((supported) => {
  if (supported && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
}).catch(() => {
  // Analytics not critical — silently ignore
});
