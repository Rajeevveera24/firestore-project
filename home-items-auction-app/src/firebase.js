// src/firebase.js
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_API_KEY is required");
    })(),
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_AUTH_DOMAIN is required");
    })(),
  projectId:
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_PROJECT_ID is required");
    })(),
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_STORAGE_BUCKET is required");
    })(),
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_MESSAGING_SENDER_ID is required");
    })(),
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_APP_ID is required");
    })(),
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ||
    (() => {
      throw new Error("REACT_APP_FIREBASE_MEASUREMENT_ID is required");
    })(),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
