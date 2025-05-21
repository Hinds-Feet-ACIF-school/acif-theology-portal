// src/config/firebaseClient.config.ts
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Optional

// Your web app's Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional
};

// Check if all required config values are present (good practice)
if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.storageBucket ||
    !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId
) {
  console.error(
    "Firebase client config is incomplete. Ensure all VITE_FIREBASE_ environment variables are set in your .env file."
  );
  // Depending on your app, you might want to throw an error here or handle it gracefully
  // For now, we'll let it proceed, but Firebase initialization might fail if critical values are missing.
}

let app: FirebaseApp;

if (!getApps().length) {
  // No Firebase apps have been initialized yet, so initialize the default app
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase client app initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase client app:", error);
    // Handle the error appropriately, e.g., show a message to the user
    // For now, re-throw or assign a dummy app to prevent further errors if 'app' is used elsewhere
    throw error; // or handle more gracefully
  }
} else {
  // A Firebase app (likely the default one) has already been initialized.
  // Get a reference to it.
  app = getApp(); // This gets the default '[DEFAULT]' app
  console.log("Firebase client app already initialized. Using existing instance.");
}

// Optional: Initialize Analytics if needed and measurementId is present
// let analytics;
// if (firebaseConfig.measurementId) {
//   analytics = getAnalytics(app);
// }

export { app }; // Export the initialized Firebase app instance
// export { app, analytics }; // If you also export analytics