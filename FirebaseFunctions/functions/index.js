//#region Initialization
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config ={
    apiKey: "AIzaSyCZAxsA1VqC6xBZjrHsI_pYAqk78jnxnno",
    authDomain: "socialmediaclone-c3756.firebaseapp.com",
    projectId: "socialmediaclone-c3756",
    storageBucket: "socialmediaclone-c3756.appspot.com",
    messagingSenderId: "574817953283",
    appId: "1:574817953283:web:d12ed85bc1680ffe669036",
    measurementId: "G-ZJM2Q8K3YC"
  };

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();
//#endregion

//#region Screams get/set
app.get('/scream', (request, response) =>{
    db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data =>{
        let screams = [];
        data.forEach(doc =>{
            screams.push({
                screamId: doc.id,
                ...doc.data()
            });
        });
        return response.json(screams);
    })
    .catch((error)=>{console.error(error)})
});

app.post('/scream', (request, response)=>{
    const newScream = {
        body:request.body.body,
        userHandle:request.body.userHandle,
        createdAt:new Date().toJSON(),
    };

    db.collection('screams')
        .add(newScream)
        .then(doc => {
            response.json({message: `document ${doc.id} was created successfully`})
        })
        .catch(error=>{
            response.status(500).json({error: 'something went wrong'})
            console.error(error);
        });
});
//#endregion

//#region HELPRERS
const isEmpty = function(string) {
    if (string.trim()===''){
        return true;
    }
    else{
        return false;
    }
}

const isEmail = function(email){
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)){
        return true;
    }
    else{
        return false
    }
}
//#endregion

//#region SignUp
app.post('/signup', (request, response)=>{


    const newUser={
        email : request.body.email,
        password : request.body.password,
        confirmPassword : request.body.confirmPassword,
        handle : request.body.handle,
    }

    let errors={};

    //#region DATA VALIDATION
    if(isEmpty(newUser.email)){
        errors.email='Must not be empty';
    }
    else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email';
    }

    if(isEmpty(newUser.password)){
        errors.password='Must not be empty';
    }

    if(newUser.confirmPassword!==newUser.password){
        errors.confirmPassword='Passwords must match';
    }

    if(isEmpty(newUser.handle)){
        errors.handle='Must not be empty';
    }

    if(Object.keys(errors).length>0){
        return response.status(400).json(errors);
    }
    //#endregion

    let userId, token;
    db.doc(`/users/${newUser.handle}`) //try to access the just created user document if it exists
    .get()
    .then(doc => {
        if(doc.exists){
            return response.status(400).json({handle: 'this handle is already taken'})
        }
        else{
            return firebase.auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)

        }
    })
    .then(data=>{
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then(idToken => {
        token = idToken;
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toJSON(),
            userId
        }
        return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(()=>{
        return response.status(201).json({token})
    })
    .catch(error=>{
        console.error(error);
        if(error.code === 'auth/email-already-in-use'){
            return response.status(400).json({email: "Email already in use"});
        }
        else{
            return response.status(500).json({error: error.code});
        }
    });

});
//#endregion

//#region Login
app.post('/login', (request, response)=>{
    const user = {
        email:request.body.email,
        password: request.body.password
    };

    
    //#region Data validation
    let errors ={};
    if(isEmpty(user.email)){
        errors.email = 'Must not be empty';
    }

    if(isEmpty(user.password)){
        errors.password = 'Must not be empty';
    }

    if(Object.keys(errors).length>0){
        return response.status(400).json(errors);
    }
    //#endregion

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(tokenId=>{
        return response.json({tokenId});
    })
    .catch((error)=>{
        console.error(error);

        if(error.code='auth/invalid-email'){
            return response.status(403).json({general: 'Wrong credentials, please try again'});
        }
        else{
            return response.status(500).json({error: error.code});
        }
    })
});
//#endregion
exports.api = functions.region('europe-west1').https.onRequest(app);