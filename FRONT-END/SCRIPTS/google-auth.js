import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
// Initialize Firebase Authentication and get a reference to the service

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
const auth = getAuth(app);

// Google Authentication Provider
const provider = new GoogleAuthProvider();

// Handle Google Sign-In Button Click
document.getElementById('googleSignInButton').addEventListener('click', function () {
    signInWithPopup(auth, provider)
    .then((result) => {
        // User successfully signed in with Google
        const user = result.user;
        console.log('Google Sign-In Success: ', user);

        // Save user data to localStorage
        localStorage.setItem('userID', user.uid);
        localStorage.setItem('userEmail', user.email);



        // You can now handle user data, redirect to a new page, etc.
        alert('Successfully signed in with Google!');
        // window.location.href = 'CustomerHome.html';
    })
    .catch((error) => {
        // Handle any errors during sign-in
        console.error('Error during Google Sign-In:', error);
        alert('Google Sign-In failed. Please try again.');
    });
});
