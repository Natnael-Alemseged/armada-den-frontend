
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
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
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

if (!VAPID_KEY) {
    console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set. Push notifications will fail.");
}
