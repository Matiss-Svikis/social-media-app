const {db} = require('../utility/admin');

/*
    This function is responsible for getting all of the screams
*/
exports.getAllScreams = (request, response) =>{
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
}

/*
    This function is responsible for posting one scream
*/
exports.postOneScream = (request, response)=>{
    const newScream = {
        body:request.body.body,
        userHandle:request.user.handle, // get the user handle from the token & backend not from the front end, meaning we only send the body from the frontend
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
}

/*
     This function is responsible for getting all the information about one scream
     it will look like the following:
     {
    "createdAt": "2021-01-16T22:32:44.660Z",
    "userHandle": "user",
    "body": "Loud scream",
    "screamId": "9hL0PfVoQLsDziAWcZiZ",
    "comments": [
        {
            "userHandle": "user",
            "body": "nice one mate",
            "createdAt": "2021-01-17T10:14:36.396Z",
            "screamId": "9hL0PfVoQLsDziAWcZiZ"
        },
        {
            "body": "Also nice but faster",
            "screamId": "9hL0PfVoQLsDziAWcZiZ",
            "createdAt": "2021-01-16T10:14:36.396Z",
            "userHandle": "user"
        }
    ]
}
*/
exports.getScream = (request, response) =>{
    let screamData = {};
    db.doc(`/screams/${request.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return response.status(404).json({error: 'Scream not found'});
        }
        screamData = doc.data();
        screamData.screamId= doc.id;
        return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', request.params.screamId)
        .get();
    })
    .then(data =>{
        screamData.comments= [];
        data.forEach(doc =>{
            screamData.comments.push(doc.data());
        });
        return response.json(screamData);
    })
    .catch(error=>{
        console.error(error);
        response.status(500).json({error:error.code});
    })
}

/*
     This function is responsible for posting a comment on one scream that would look like so:
        {
        "body": "comment test",
        "createdAt": "2021-01-20T14:38:28.384Z",
        "userHandle": "user",
        "screamId": "9hL0PfVoQLsDziAWcZiZ",
        "userImage": "https://firebasestorage.googleapis.com/v0/b/socialmediaclone-c3756.appspot.com/o/85985437846.jpg?alt=media"
    }
*/
exports.commentOnScream = (request, response) =>{
    if(request.body.body.trim() === ''){
        return response.status(400).json({error: 'Must not be empty'});
    }
    const newComment = {
        body:request.body.body,
        createdAt: new Date().toJSON(),
        userHandle:request.user.handle,
        screamId: request.params.screamId,
        userImage: request.user.imageUrl,
    }

    db.doc(`/screams/${request.params.screamId}`).get()
    .then(doc =>{
        if(!doc.exists){
            return response.status(404).json({error:'Scream doesnt exist'});
        }

        return db.collection('comments').add(newComment);
    })
    .then(()=>{
        response.json(newComment);
    })
    .catch(error =>{
        console.log(error);
        return response.status(500).json({error:error.code});
    })
}