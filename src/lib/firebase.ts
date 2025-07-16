import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAW7cuoFmdC1tpF-Q5KlXefaeHg96BsPRY",
  authDomain: "perform-93a38.firebaseapp.com",
  projectId: "perform-93a38",
  storageBucket: "perform-93a38.firebasestorage.app",
  messagingSenderId: "549024426144",
  appId: "1:549024426144:web:1eb097252efacd11d941c5",
  measurementId: "G-6SGE15WS73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Analytics 초기화 (브라우저 환경에서만)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app; 