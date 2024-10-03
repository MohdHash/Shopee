import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoppniTxOzX0jfxzdWEDHKjnTXpYVkAlQ",
    authDomain: "shopee-cd540.firebaseapp.com",
    projectId: "shopee-cd540",
    storageBucket: "shopee-cd540.appspot.com",
    messagingSenderId: "464641933035",
    appId: "1:464641933035:web:ad908eea5c9f7f28b448ae"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
