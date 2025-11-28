
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBODhOfaN2LY4CSgadLuonKABBfL__YmmE",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "h-armada-den.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "h-armada-den",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "h-armada-den.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "212784625390",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:212784625390:web:c40568e62307f3bab4e5ff"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let messaging: Messaging | null = null;

if (typeof window !== "undefined") {
    try {
        messaging = getMessaging(app);
    } catch (err) {
        console.error('Firebase Messaging not supported:', err);
    }
}

export { app, messaging };
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "YOUR_FIREBASE_VAPID_KEY";

if (VAPID_KEY === "YOUR_FIREBASE_VAPID_KEY") {
    console.warn("VAPID_KEY is not set in environment variables. Push notifications will fail.");
}
