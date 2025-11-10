/**
 * Firebase Configuration and Lazy Loading
 *
 * PERFORMANCE OPTIMIZATION:
 * - Firebase SDK is loaded ONLY when needed (when user enables notifications)
 * - Reduces initial bundle size by ~250KB
 * - Improves initial page load time
 * - Firebase modules are dynamically imported on-demand
 */

// Firebase config - this is lightweight (just a plain object)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Cached references - loaded on-demand
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let firebaseApp: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging: any = null;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

/**
 * Lazy initialize Firebase App (only when needed)
 */
const initializeFirebaseApp = async () => {
  if (firebaseApp) return firebaseApp;

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    firebaseApp =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return firebaseApp;
  } catch (error) {
    console.error("Failed to initialize Firebase app:", error);
    return null;
  }
};

/**
 * Lazy initialize Firebase Cloud Messaging (only when user enables notifications)
 * This is the main performance optimization - messaging is loaded on-demand
 */
const initializeMessaging = async () => {
  // Return cached instance if already initialized
  if (messaging) return messaging;

  // Prevent multiple simultaneous initializations using a Promise
  if (initializationPromise) {
    return initializationPromise;
  }

  if (typeof window === "undefined") return null;

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      // Dynamically import Firebase messaging module
      const { getMessaging, isSupported } = await import("firebase/messaging");

      const supported = await isSupported();
      if (!supported) {
        isInitializing = false;
        initializationPromise = null;
        return null;
      }

      // Initialize Firebase app first
      const app = await initializeFirebaseApp();
      if (!app) {
        isInitializing = false;
        initializationPromise = null;
        return null;
      }

      // Initialize messaging
      messaging = getMessaging(app);
      isInitializing = false;
      initializationPromise = null;
      return messaging;
    } catch (error) {
      console.error("Failed to initialize Firebase messaging:", error);
      isInitializing = false;
      initializationPromise = null;
      throw error;
    }
  })();
  return initializationPromise;
};

/**
 * Request notification permission and get FCM token
 * This will lazy-load Firebase when called
 */
export const requestForToken = async (): Promise<string | null> => {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return null;
    }

    // Lazy load messaging when user actually requests notifications
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      console.warn('Firebase messaging not supported');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn('Notification permission denied');
      return null;
    }

    // Dynamically import getToken
    const { getToken } = await import("firebase/messaging");

    // Register and wait for the service worker to be ready
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Wait for the service worker to be active
    if (registration.installing) {
      await new Promise((resolve) => {
        registration.installing!.addEventListener('statechange', (e: Event) => {
          const target = e.target as ServiceWorker;
          if (target.state === 'activated') {
            resolve(undefined);
          }
        });
      });
    } else if (registration.waiting) {
      await new Promise((resolve) => {
        registration.waiting!.addEventListener('statechange', (e: Event) => {
          const target = e.target as ServiceWorker;
          if (target.state === 'activated') {
            resolve(undefined);
          }
        });
      });
    }

    // Get FCM token with the active service worker
    const currentToken = await getToken(messagingInstance, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      console.log('FCM token retrieved successfully');
    } else {
      console.warn('No registration token available');
    }

    return currentToken || null;
  } catch (err) {
    console.error("An error occurred while retrieving token:", err);
    return null;
  }
};

/**
 * Get Firebase messaging instance (lazy loads if needed)
 */
export const getMessagingInstance = async () => {
  return await initializeMessaging();
};

// Export lazy initialization function
export { initializeMessaging };

// For backward compatibility - messaging will be null until initialized
export { messaging };
