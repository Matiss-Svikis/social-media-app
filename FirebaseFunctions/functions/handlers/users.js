const {db} = require('../utility/admin');
const {config} = require('../utility/config');
const firebase = require('firebase');
const {validateSignupData, validateLoginData} = require('../utility/validators');

firebase.initializeApp(config);

exports.signup= (request, response)=>{

    const newUser={
        email : request.body.email,
        password : request.body.password,
        confirmPassword : request.body.confirmPassword,
        handle : request.body.handle,
    }

    const {valid, errors} = validateSignupData(newUser);
    
    if(!valid){
        return response.status(400).json(errors);
    }

    let userId, token;
    db.doc(`/users/${newUser.handle}`) //try to access the just created user document if it exists
    .get()
    .then(doc => {
        if(doc.exists){
            return response.status(400).json({handle: 'this handle is already taken'})
        }
        else{
            console.log('first then')
            return firebase.auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)

        }
    })
    .then(data=>{
        console.log('second then')
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
}

exports.login = (request, response)=>{
    const user = {
        email:request.body.email,
        password: request.body.password
    };

    const {valid, errors} = validateLoginData(user);
    
    if(!valid){
        return response.status(400).json(errors);
    }

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
}