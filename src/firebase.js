// src/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

// === Экспорты, которые ждут твои компоненты ===
export const auth = firebase.auth();
export const db   = firebase.firestore();

// Персистентность сессии (чтобы не выкидывало после логина)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.warn);

// Провайдер Google
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;
