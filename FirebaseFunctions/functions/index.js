const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/scream', (request, response) =>{
    admin.firestore().collection('screams').get()
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
        createdAt:admin.firestore.Timestamp.fromDate(new Date()),
    };

    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {
            response.json({message: `document ${doc.id} was created successfully`})
        })
        .catch(error=>{
            response.status(500).json({error: 'something went wrong'})
            console.error(error);
        });
});

exports.api = functions.https.onRequest(app);