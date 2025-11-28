
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "[REDACTED]",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "[REDACTED]",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "[REDACTED]",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "[REDACTED]",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "[REDACTED]",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:[REDACTED]:web:c40568e62307f3bab4e5ff"
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
