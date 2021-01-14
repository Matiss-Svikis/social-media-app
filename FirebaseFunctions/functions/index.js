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

//sign up route
app.post('/signup', (request, response)=>{
    const newUser={
        email : request.body.email,
        password : request.body.password,
        confirmPassword : request.body.confirmPassword,
        handle : request.body.handle,
    }

    let userId, token;

    //TODO validate data
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

})

exports.api = functions.region('europe-west1').https.onRequest(app);