//#region Initialization
const functions = require("firebase-functions");
// allright, backend is finished, yt video at 4h and 23 mins
const app = require('express')();
const { db } = require('./utility/admin');
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
    getUserDetails,
    markNotificationsRead,
} = require('./handlers/users');

const { firebaseAuthentication } = require('./utility/firebaseAuthentication');
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
app.get('/users/:handle', getUserDetails);
app.post('/notifications', firebaseAuthentication, markNotificationsRead);

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('europe-west1').firestore.document('likes/{id}').onCreate((snapshot) => {
    db.doc(`/screams/${snapshot.data().screamId}`).get()
        .then(doc => {
            if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toJSON(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'like',
                    read: false,
                    screamId: doc.id,
                })
            }
        })
        .catch(error => {
            console.error(error);
        })
})

exports.deleteNotificationOnUnlike = functions.region('europe-west1').firestore.document('likes/{id}').onDelete((snapshot) => {
    return db.doc(`notifications/${snapshot.id}`)
        .delete()
        .catch(error => {
            console.error(error);
            return;
        })
})

exports.createNotificationOnComment = functions.region('europe-west1').firestore.document('comments/{id}').onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
        .then(doc => {
            if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toJSON(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'comment',
                    read: false,
                    screamId: doc.id,
                })
            }
        })
        .catch(error => {
            console.error(error);
            return; //no need to send back a response because this is a database trigger
        })
})

exports.onUserImageChange = functions.region('europe-west1').firestore.document('/users/{userId}').onUpdate((change) => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
        const batch = db.batch();
        return db.collection("screams").where("userHandle", "==", change.before.data().handle).get().then(data => {
            data.forEach(doc => {
                const scream = db.doc(`/screams/${doc.id}`);
                batch.update(scream, { userImage: change.after.data().imageUrl });
            });
            return batch.commit();
        })
    } else return true;
})

exports.onScreamDeleted = functions.region('europe-west1').firestore.document('/screams/{screamId}').onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db.collection("comments").where("screamId", "==", screamId).get()
        .then(data => {
            data.forEach(doc => {
                batch.delete(db.doc(`/comments/${doc.id}`));
            })
            return db.collection("likes").where("screamId", '==', screamId).get();
        })
        .then(data => {
            data.forEach(doc => {
                batch.delete(db.doc(`/likes/${doc.id}`));
            })
            return db.collection("notifications").where("screamId", '==', screamId).get();
        })
        .then(data => {
            data.forEach(doc => {
                batch.delete(db.doc(`/notifications/${doc.id}`));
            })
            batch.commit();
        })
        .catch(err => {
            console.error(err);
        })
});