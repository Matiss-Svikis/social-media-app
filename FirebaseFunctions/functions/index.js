//#region Initialization
const functions = require("firebase-functions");
const app = require('express')();
const {getAllScreams, postOneScream} = require('./handlers/screams');
const {signup, login} = require('./handlers/users');
const {firebaseAuthentication} = require('./utility/firebaseAuthentication');

//Scream routes
app.get('/scream', firebaseAuthentication, getAllScreams);
app.post('/scream', firebaseAuthentication, postOneScream);

//User routes
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.region('europe-west1').https.onRequest(app);