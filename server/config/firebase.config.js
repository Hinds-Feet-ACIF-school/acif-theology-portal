// src/config/firebase.config.js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

dotenv.config();

console.log("----- Firebase Config Environment Check -----");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "Set" : "MISSING!");
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "Set" : "MISSING!");
console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? `Set (Length: ${process.env.FIREBASE_PRIVATE_KEY.length})` : "MISSING!");

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
let processedPrivateKey = rawPrivateKey;

if (rawPrivateKey) {
    processedPrivateKey = rawPrivateKey.replace(/\\n/g, "\n");
 
    if (processedPrivateKey && typeof processedPrivateKey === 'string') {
       const keyLines = processedPrivateKey.split('\n').map(line => line.trim()).filter(line => line.length > 0);
       if (keyLines.length > 2 && keyLines[0] === '-----BEGIN PRIVATE KEY-----' && keyLines[keyLines.length - 1] === '-----END PRIVATE KEY-----') {
            processedPrivateKey = keyLines.join('\n');
            console.log("Private key processed (split/trimmed/rejoined).");
       } else {
            console.warn("Processed private key does not seem to match expected PEM structure after splitting.");
            processedPrivateKey = rawPrivateKey.replace(/\\n/g, "\n");
       }
    }
} else {
    console.error("FIREBASE_PRIVATE_KEY is missing from environment variables!");
    processedPrivateKey = undefined;
}

console.log("----- Service Account Object for cert() -----");
console.log("Private Key (Final type before cert):", typeof processedPrivateKey);
console.log("Private Key (Snippet after ALL processing):", processedPrivateKey ? `${processedPrivateKey.substring(0, 30)}...${processedPrivateKey.substring(processedPrivateKey.length - 30)}` : "MISSING or Undefined!");
console.log("------------------------------------------");

const serviceAccount = {
  type: process.env.FIREBASE_TYPE || "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: processedPrivateKey, 
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};


let db, auth, storage;
try {
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error("FATAL ERROR: Missing required Firebase Admin SDK credentials (project_id, client_email, or private_key) before calling cert()!");
  }
  console.log("Attempting Firebase Admin SDK initialization...");
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log("Firebase Admin SDK initialized successfully.");
  db = getFirestore();
  auth = getAuth();
  storage = getStorage();
} catch (initError) {
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error("!!! FIREBASE ADMIN SDK INITIALIZATION FAILED !!!");
  console.error("Error during initializeApp or cert():", initError);
  console.error("Review the service account details logged above.");
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  process.exit(1);
}

export { db, auth, storage };