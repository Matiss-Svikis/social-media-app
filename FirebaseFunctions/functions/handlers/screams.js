const {db} = require('../utility/admin');

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