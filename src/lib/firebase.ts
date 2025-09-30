// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Cloud Messaging and get a reference to the service
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging: any = null;

const initializeMessaging = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
    }
  }
  return messaging;
};

// Initialize messaging
if (typeof window !== "undefined") {
  initializeMessaging();
}

export { messaging, initializeMessaging };

// Request permission and get FCM token
export const requestForToken = async (): Promise<string | null> => {
  try {
    // Ensure messaging is initialized
    const messagingInstance = messaging || (await initializeMessaging());
    if (!messagingInstance) return null;

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (currentToken) {
        return currentToken;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
    return null;
  }
};
