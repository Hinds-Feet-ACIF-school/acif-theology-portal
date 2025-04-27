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
console.log("FIREBASE_STORAGE_BUCKET:", process.env.FIREBASE_STORAGE_BUCKET ? "Set" : "MISSING!");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "MISSING!");
console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET ? "Set" : "MISSING!");

const serviceAccount = {
  type: process.env.FIREBASE_TYPE || "service_account", 
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

console.log("----- Service Account Object for cert() -----");

console.log("Type:", serviceAccount.type);
console.log("Project ID:", serviceAccount.project_id);
console.log("Client Email:", serviceAccount.client_email);
console.log("Private Key ID:", serviceAccount.private_key_id);
console.log("Private Key (Snippet):", serviceAccount.private_key ? `${serviceAccount.private_key.substring(0, 30)}...${serviceAccount.private_key.substring(serviceAccount.private_key.length - 30)}` : "MISSING or Undefined!");
console.log("------------------------------------------");

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
  console.error("Ensure the FIREBASE_PRIVATE_KEY environment variable on Render contains the correct, complete key including BEGIN/END markers and newlines.");
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  
  process.exit(1);
}

export { db, auth, storage };