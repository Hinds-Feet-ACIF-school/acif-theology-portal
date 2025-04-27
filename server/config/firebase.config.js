import admin from 'firebase-admin';
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

dotenv.config();

initializeApp({
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

export { db, auth, storage };