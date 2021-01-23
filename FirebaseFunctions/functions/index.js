//#region Initialization
const functions = require("firebase-functions");
const app = require('express')();
const db = require('./util/admin');
const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream,
} = require('./handlers/screams');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
} = require('./handlers/users');

const {firebaseAuthentication} = require('./utility/firebaseAuthentication');
//#endregion

//Scream routes
app.get('/scream', firebaseAuthentication, getAllScreams);
app.post('/scream', firebaseAuthentication, postOneScream);
app.get('/scream/:screamId', getScream); //the column in the route is for url parameters
app.post('/scream/:screamId/comment', firebaseAuthentication, commentOnScream);
app.get('/scream/:screamId/like', firebaseAuthentication, likeScream);
app.get('/scream/:screamId/unLike', firebaseAuthentication, unlikeScream);
app.delete('/scream/:screamId', firebaseAuthentication, deleteScream)

//User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/users/image', firebaseAuthentication, uploadImage);
app.post('/users', firebaseAuthentication, addUserDetails);
app.get('/users', firebaseAuthentication, getAuthenticatedUser);

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('europe-west1').firestore.document('likes/{id}')
.onCreate((snapshot) => {
    db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt:new Date().toJSON(),
                recipient:doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'like',
                read:false,
                screamId: doc.id,
            })
            .then(() => {
                return;
            })
            .catch(error =>{
                console.error(error);
                return; //no need to send back a response because this is a database trigger
            })
        }
    })
})

exports.createNotificationOnComment = functions.region('europe-west1').firestore.document('comments/{id}')
.onCreate((snapshot)=>{
    db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt:new Date().toJSON(),
                recipient:doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'comment',
                read:false,
                screamId: doc.id,
            })
            .then(() => {
                return;
            })
            .catch(error =>{
                console.error(error);
                return; //no need to send back a response because this is a database trigger
            })
        }
    })
})
