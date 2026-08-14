/* ==========================================================================
   MANIYAR STORE — js/firebase.js
   ------------------------------------------------------------------------
   This file is a READY-TO-USE TEMPLATE, not yet wired into the site.
   The site currently runs entirely on localStorage (see products.js,
   cart.js, wishlist.js) — no backend is required to use it.

   When you're ready to move to a real, shared, cloud database (so that
   products/orders update for ALL visitors and don't just live in one
   browser), follow the steps below.

   NOTHING IN THIS FILE IS ACTIVE. No fake keys are used — you must paste
   your own Firebase project config where marked, and add the <script>
   tags described at the bottom to the pages that need them.
   ========================================================================== */

/* --------------------------------------------------------------------------
   STEP 1 — Create a Firebase project
   --------------------------------------------------------------------------
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it e.g. "maniyar-store" → follow the setup.
   3. Inside the project, click the "</>" (Web) icon to register a web app.
   4. Firebase will show you a config object like the one below (with your
      OWN real values). Copy it and paste it into FIREBASE_CONFIG below.
--------------------------------------------------------------------------- */

const FIREBASE_CONFIG = {
  // TODO: paste your real config here — replace every value below.
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

/* --------------------------------------------------------------------------
   STEP 2 — Add the Firebase SDK to your HTML pages
   --------------------------------------------------------------------------
   Add these THREE script tags to a page, right BEFORE js/firebase.js, and
   right before your page's own script (app.js / product.js / admin.js etc):

   <script type="module">
     import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
     import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc }
       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
     import { getStorage, ref, uploadBytes, getDownloadURL }
       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
     import { getAuth, signInWithEmailAndPassword, onAuthStateChanged }
       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

     const app = initializeApp(FIREBASE_CONFIG); // FIREBASE_CONFIG from this file
     const db = getFirestore(app);
     const storage = getStorage(app);
     const auth = getAuth(app);
     window.firebaseApp = { app, db, storage, auth,
       collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
       ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword, onAuthStateChanged };
   </script>

   Note: Firebase's modern SDK is a JavaScript "module", so it's loaded with
   type="module" and its own import lines rather than a plain <script src>.
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   STEP 3 — Firestore collections this project expects
   --------------------------------------------------------------------------
   products    — one document per product. Same shape as an item in
                 DEFAULT_PRODUCTS inside js/products.js:
                 { name, category, gender, price, discountPrice, image,
                   images:[], sizes:[], colors:[], description, stock,
                   tag, rating }

   orders      — one document per order. Same shape as an order created by
                 createOrder() in js/cart.js:
                 { date, customer:{name,mobile,address,city,pincode,state,notes},
                   items:[{productId,name,size,color,qty,price}],
                   subtotal, shipping, total, status }

   users       — (optional) one document per registered customer/admin, if
                 you add customer accounts later:
                 { name, email, phone, role }

   categories  — (optional) one document per category if you want to manage
                 categories from the dashboard instead of the CATEGORIES
                 array in js/products.js:
                 { name, imageUrl }
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   STEP 4 — Example: replace getProducts() with a Firestore read
   --------------------------------------------------------------------------
   Once the SDK is loaded (Step 2), you can replace the localStorage-based
   getProducts() in js/products.js with something like this:

   async function getProductsFromFirestore() {
     const { db, collection, getDocs } = window.firebaseApp;
     const snapshot = await getDocs(collection(db, "products"));
     return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
   }

   Because this becomes asynchronous (you must "await" it), every page that
   currently calls getProducts() directly (app.js, product.js, admin.js)
   would need small updates to "await" the result — for example:

     const products = await getProductsFromFirestore();

   This is the main code change involved in switching from localStorage to
   Firestore. Do it gradually, one page at a time, and test each page.
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   STEP 5 — Example: save a new product to Firestore (from admin.js)
   --------------------------------------------------------------------------
   async function saveProductToFirestore(productData) {
     const { db, collection, addDoc } = window.firebaseApp;
     await addDoc(collection(db, "products"), productData);
   }
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   STEP 6 — Example: upload a product image to Firebase Storage
   --------------------------------------------------------------------------
   async function uploadProductImage(file) {
     const { storage, ref, uploadBytes, getDownloadURL } = window.firebaseApp;
     const imageRef = ref(storage, "products/" + Date.now() + "_" + file.name);
     await uploadBytes(imageRef, file);
     return await getDownloadURL(imageRef); // use this URL as the product's image
   }

   This replaces the base64-in-localStorage image upload currently used in
   js/admin.js (the pf_imageFile input), and is the recommended approach
   once you have real customers, since localStorage has a small size limit
   (roughly 5–10MB per browser) while Firebase Storage does not.
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   STEP 7 — Example: secure the admin dashboard with Firebase Authentication
   --------------------------------------------------------------------------
   Right now, js/admin.js uses a single hard-coded password
   (ADMIN_PASSWORD) — fine for personal use, not secure for a real business.

   To use real login instead:
   1. In the Firebase Console → Authentication → Sign-in method, enable
      "Email/Password".
   2. Add yourself as a user under Authentication → Users.
   3. Replace the password check in js/admin.js with:

      async function attemptLogin(email, password) {
        const { auth, signInWithEmailAndPassword } = window.firebaseApp;
        try {
          await signInWithEmailAndPassword(auth, email, password);
          showApp();
        } catch (err) {
          document.getElementById("adminLoginError").textContent = "Login failed.";
        }
      }

   4. Also set Firestore Security Rules (Firebase Console → Firestore →
      Rules) so that only logged-in admins can write to "products" and
      "orders", e.g.:

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /products/{doc} {
            allow read: if true;                 // anyone can view products
            allow write: if request.auth != null; // only logged-in admins can edit
          }
          match /orders/{doc} {
            allow create: if true;                // any visitor can place an order
            allow read, update, delete: if request.auth != null; // only admins manage orders
          }
        }
      }
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   You do not need to do any of this to launch the site. The current
   localStorage version works fully on its own and is a good way to start
   collecting real orders via WhatsApp/checkout while you get comfortable.
   Move to Firebase whenever you want the catalog and orders to be shared
   across every visitor's device instead of stored per-browser.
--------------------------------------------------------------------------- */
