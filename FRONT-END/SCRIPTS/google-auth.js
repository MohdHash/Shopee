import {signInWithPopup, GoogleAuthProvider} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { auth } from './auth.js';
import { createUserInFirestore } from "./sub-login.js";
// Google Authentication Provider   
const provider = new GoogleAuthProvider();

// Handle Google Sign-In Button Click
document.getElementById('googleSignInButton').addEventListener('click', function () {
    signInWithPopup(auth, provider)
    .then((result) => {

        
        
        // User successfully signed in with Google
        const user = result.user;
        console.log('Google Sign-In Success: ', user);
        const userID = user.uid;
        const emailID = user.email;
        const name = user.displayName;
        const phoneNumber = user.phoneNumber || '9952507593'
        const creditLimit = 0;
        // Save user data to localStorage
        localStorage.setItem('userID', user.uid);

        createUserInFirestore(userID, emailID,false,name,phoneNumber,creditLimit);

        

        // You can now handle user data, redirect to a new page, etc.
        alert('Successfully signed in with Google!');

        setTimeout(()=>{
            window.location.href = 'customer.html';
        },3000);
        // window.location.href = 'CustomerHome.html';
    })
    .catch((error) => {
        // Handle any errors during sign-in
        console.error('Error during Google Sign-In:', error);
        alert('Google Sign-In failed. Please try again.');
    });
});
