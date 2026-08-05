import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVk2JzJ-NjhgGA9NVTjegFn3PsLFvOEFU",
  authDomain: "maniyarstore-952f8.firebaseapp.com",
  projectId: "maniyarstore-952f8",
  storageBucket: "maniyarstore-952f8.firebasestorage.app",
  messagingSenderId: "799276754088",
  appId: "1:799276754088:web:0791b421d01028d1908e9d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
