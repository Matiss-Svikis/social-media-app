//#region Initialization
const functions = require("firebase-functions");
const app = require('express')();
const {getAllScreams, postOneScream} = require('./handlers/screams');
const {signup, login, uploadImage, addUserDetails} = require('./handlers/users');
const {firebaseAuthentication} = require('./utility/firebaseAuthentication');

//Scream routes
app.get('/scream', firebaseAuthentication, getAllScreams);
app.post('/scream', firebaseAuthentication, postOneScream);

//User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/users/image', firebaseAuthentication,uploadImage);
app.post('/users', firebaseAuthentication, addUserDetails);

exports.api = functions.region('europe-west1').https.onRequest(app);