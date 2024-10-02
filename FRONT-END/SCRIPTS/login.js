
import {API_KEY} from "../CONSTANTS/constants.js";
import { changeToSignUp, createUserInFirestore, getUserRole } from "./sub-login.js";
let isSignIn = true;


$('#signTag').click(function(e){
    e.preventDefault();
    changeToSignUp(isSignIn);
    isSignIn =!isSignIn;
});


//SIGN IN && SIGN UP OF USER(ADMIN OR CUSTOMER)
$(document).ready(function(){
    console.log(API_KEY);

    $('#login-form').on('submit', function(e){
        e.preventDefault();

        const email = $('#email').val();
        const password = $('#pass').val();
        const name = $('#name').val();
        const phoneNumber = $('#mobile').val();
        const creditLimit = 0;
        console.log("password: " + password);
        const SignUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
        const SignInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
        const data = {
            email : email,
            password : password,
            returnSecureToken : true
        };

        if(!isSignIn){
        $.ajax({
            url :  SignUpUrl,
            method : 'POST',
            contentType : 'application/json',
            data : JSON.stringify(data),
            success : function(response){
                console.log(response);
                alert('User created successfully!');
               //registering the user in the firestore user collection:

               const userId = response.localId;
               const emailID = response.email;
               const idToken = response.idToken;

               localStorage.setItem('userId', userId);

               createUserInFirestore(userId, emailID,false,name,phoneNumber,creditLimit);
            //    getUserRole(userId,idToken);

            setTimeout(()=>{
                getUserRole(userId,idToken);
               
            },5000);
               
                // window.location.href = 'CustomerHome.html';
            },
            error : function(error){
                console.error(error);
                alert('Error creating user!');
            }
        })}else if(isSignIn){
            $.ajax({
                url : SignInUrl ,
                method : 'POST',
                contentType : 'application/json',
                data : JSON.stringify(data),
                success : function(response){
                    console.log("Logged in successfully!" + response);

                    const userID = response.localId;
                    const idTokem = response.idToken;
                    localStorage.setItem('userID', userID); 
                   getUserRole(userID, idTokem);
                //    window.location.href = 'CustomerHome.html';
                },
                error : function(error){
                    console.error(error);
                    alert('Error loggin in user!');
                }
            })
        }


    })
});