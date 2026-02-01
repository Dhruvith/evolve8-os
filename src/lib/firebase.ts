import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAw_QOzfSCvdzZE_tQP9On-rhOMaAqhIN8",
    authDomain: "evolve8-os.firebaseapp.com",
    projectId: "evolve8-os",
    storageBucket: "evolve8-os.firebasestorage.app",
    messagingSenderId: "286202173253",
    appId: "1:286202173253:web:3767aac7c73400a80b502c",
    measurementId: "G-CWWX22GK9T"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, storage, analytics };
