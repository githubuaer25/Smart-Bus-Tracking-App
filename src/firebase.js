// =============================================
// FIREBASE CONFIGURATION FILE
// =============================================
// IMPORTANT: Replace the values below with YOUR
// Firebase project config from:
// Firebase Console → Project Settings → Your Apps → SDK setup
// =============================================

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

// 🔴 REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAioJGZ8GOOJnpKHKrzKu0sE_W9A0RGQbg",
  authDomain: "bus-tracker-a375c.firebaseapp.com",
  // 🔴 databaseURL is REQUIRED for Realtime Database to work.
  // Format: https://<your-project-id>-default-rtdb.firebaseio.com
  databaseURL: "https://bus-tracker-a375c-default-rtdb.firebaseio.com",
  projectId: "bus-tracker-a375c",
  storageBucket: "bus-tracker-a375c.firebasestorage.app",
  messagingSenderId: "466471166818",
  appId: "1:466471166818:web:8d622e02ada2866d57023b",
  measurementId: "G-M0F0T6BNDZ"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Firebase Auth instance
export const auth = getAuth(app)

// Firebase Realtime Database instance
export const db = getDatabase(app)
