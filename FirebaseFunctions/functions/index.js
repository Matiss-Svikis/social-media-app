//#region Initialization
const functions = require("firebase-functions");
const app = require('express')();
const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unLikeScream
} = require('./handlers/screams');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
} = require('./handlers/users');

const {firebaseAuthentication} = require('./utility/firebaseAuthentication');

//Scream routes
app.get('/scream', firebaseAuthentication, getAllScreams);
app.post('/scream', firebaseAuthentication, postOneScream);
app.get('/scream/:screamId', getScream); //the column in the route is for url parameters
app.post('/scream/:screamId/comment', firebaseAuthentication, commentOnScream);
app.get('/scream/:screamId/like', firebaseAuthentication, likeScream);
//app.get('/scream/:screamId/unLike', firebaseAuthentication, unLikeScream);

//to do: route for delete

//User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/users/image', firebaseAuthentication,uploadImage);
app.post('/users', firebaseAuthentication, addUserDetails);
app.get('/users', firebaseAuthentication, getAuthenticatedUser);
exports.api = functions.region('europe-west1').https.onRequest(app);