// src/firebase.js
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

async function getFirebaseConfig() {
  if (window.location.hostname === "localhost") {
    // Local development - use environment variables
    return {
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
  } else {
    // Production - use Firebase Hosting auto-configuration
    const response = await fetch("/__/firebase/init.json");
    return response.json();
  }
}

// Initialize Firebase asynchronously
let app = null;
let auth = null;
let analytics = null;

async function initializeFirebase() {
  if (!app) {
    const config = await getFirebaseConfig();
    app = initializeApp(config);
    auth = getAuth(app);
    analytics = getAnalytics(app);
  }
  return { app, auth, analytics };
}

export { initializeFirebase };