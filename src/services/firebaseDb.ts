/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Firebase Firestore & Auth integration stub.
 *
 * To connect Aurelian Heights Academy to Firebase:
 * 1. Install firebase: npm install firebase
 * 2. In this file, initialize the Firebase App and Firestore SDK:
 *    import { initializeApp } from 'firebase/app';
 *    import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, ... } from 'firebase/firestore';
 *    import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
 * 3. Fill out the method implementations below matching the ApiService interface in api.ts.
 * 4. Switch the export source in api.ts to import from firebaseDb instead of localDb.
 *
 * See README.md for full collection schema and Firestore security rules.
 */

/*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
*/

export const firebaseDbStub = {
  description: 'Firestore connector ready for deployment. See README.md for schema and rules.',
};
