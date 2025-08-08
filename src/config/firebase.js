// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAryqScHR9B7peDWJCTPUvK3VqF7ytt7f4",
    authDomain: "filealchemy-cbaf9.firebaseapp.com",
    projectId: "filealchemy-cbaf9",
    storageBucket: "filealchemy-cbaf9.firebasestorage.app",
    messagingSenderId: "745651077091",
    appId: "1:745651077091:web:5e41b1be83b1d558ddead6",
    measurementId: "G-6TX9W02JB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;