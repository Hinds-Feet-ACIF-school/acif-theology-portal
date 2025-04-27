// src/config/firebase.config.js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,

};

if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
  console.error("FATAL ERROR: Missing required Firebase service account environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY).");
} else {
   console.log("Attempting Firebase Admin SDK initialization with provided service account variables.");
}


const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, 
});

console.log("Firebase Admin SDK initialized."); 

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

export { db, auth, storage };