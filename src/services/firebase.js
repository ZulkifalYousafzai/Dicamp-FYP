import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDKOTvL0W3qNeAKECmQx23zklYqiadnx9Y",
  authDomain: "fyp-evaluation-system-31751.firebaseapp.com",
  projectId: "fyp-evaluation-system-31751",
  storageBucket: "fyp-evaluation-system-31751.firebasestorage.app",
  messagingSenderId: "518376407068",
  appId: "1:518376407068:web:f923cd55e70daffe585fd9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);