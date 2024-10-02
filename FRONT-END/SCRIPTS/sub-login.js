import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js";

export function changeToSignUp(isSignIn){
    const logintext = document.getElementById('login-text');
    const btn = document.getElementById('btn');
    const forgot = document.getElementById('forgot-password-container');
    const isRegister = document.getElementById('isRegistered');
    const signTag = document.getElementById('signTag');

    const nameField = document.getElementById('name');
    const mobileField = document.getElementById('mobile');

    if(isSignIn){
        logintext.innerText = 'Sign Up';
        btn.innerText = 'Sign Up';
        forgot.style.display = 'none';
        isRegister.innerText = 'Already Registered?';
        signTag.innerText = 'Sign In';

        nameField.style.display = 'block';
        mobileField.style.display = 'block';

    }else{
        logintext.innerText = 'Login';
        btn.innerText = 'Sign In';
        forgot.style.display = 'block';
        isRegister.innerText = 'Not Registered';
        signTag.innerText = 'Sign Up';

        nameField.style.display = 'none';
        mobileField.style.display = 'none';
    }
    
}

export function getUserRole(userId , idToken){
    const userDocUrl = `${FIRESTORE_BASE_URL}/users/${userId}`;

    $.ajax({
        url : userDocUrl,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}`
        },
        success: function(response){
            const userData = response.fields;
            const isAdmin = userData.isAdmin.booleanValue;

            console.log('user date'+ userData);

            if(isAdmin){
                window.location.href = 'AdminHomePage.html';
            }else{
                // window.location.href = 'CustomerHome.html';
                window.location.href = 'customer.html';
            }
        },
        error: function(xhr,status ,error){
            console.log('Error receiving user data: '+ xhr.responseJSON.error.message);

        }
    });
};

export function createUserInFirestore(userID , emailID , isAdmin,name,phoneNumber,creditLimit){
    const  userFirestoreURL = `${FIRESTORE_BASE_URL}/users/${userID}`;
    const customerFirestoreURL = `${FIRESTORE_BASE_URL}/customers/${userID}`;
    const userData = {
        fields:{
            email:{stringValue:emailID},
            isAdmin:{booleanValue:isAdmin}
        }
    };

    const customerData = {
        fields:{
            name: { stringValue: name },
            email: { stringValue: emailID },
            mobileNumber: { stringValue: phoneNumber },
            creditLimit: { integerValue: creditLimit }
        }
    }

    $.ajax({
        url: userFirestoreURL,
        method: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response){
            console.log('User created successfully in Firestore: '+ JSON.stringify(response));
        },
        error: function(xhr,status, error){
            console.log('Error creating user in Firestore: '+ xhr.responseJSON.error.message);
        }
    });

    $.ajax({
        url: customerFirestoreURL,
        method: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(customerData),
        success: function(response){
            console.log('Customer created successfully in Firestore: '+ JSON.stringify(response));
        },
        error: function(xhr,status, error){
            console.log('Error creating customer in Firestore: '+ xhr.responseJSON.error.message);
        }
    });
};