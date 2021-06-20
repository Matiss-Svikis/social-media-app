//#region Initializations
const { db, admin } = require('../utility/admin');
const { config } = require('../utility/config');
const firebase = require('firebase');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../utility/validators');
//#endregion

firebase.initializeApp(config);

/**
 This function is responsible for user signup into the system
 It registers user in firbase and creates a document for him aswell with the document title being the user handle
 and it contains following information:
 userHandle = {
     createdAt: {created date in JSON format},
     email,
     handle,
     userId, {created users uid}
 }

 The request parameter recieves the following data:
 {
     Email
     password
     confirmPassword
     handle
 }
 */
exports.signup = (request, response) => {

    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    }

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) {
        return response.status(400).json(errors);
    }

    const noImg = 'no-image.png';

    let userId, token;
    db.doc(`/users/${newUser.handle}`) //try to access the just created user document if it exists
        .get()
        .then(doc => {
            if (doc.exists) {
                return response.status(400).json({ handle: 'this handle is already taken' })
            }
            else {
                return firebase.auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)

            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toJSON(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials)
        })
        .then(() => {
            return response.status(201).json({ token })
        })
        .catch(error => {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                return response.status(400).json({ email: "Email already in use" });
            }
            else {
                return response.status(500).json({ general: "Something went wrong, please try again" });
            }
        });
}

/**
 This function is responsible for user authentication into the system
 The request parameter recieves the following data:
 {
     Email
     password
 }
 */
exports.login = (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) {
        return response.status(400).json(errors);
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return response.json({ token });
        })
        .catch((error) => {
            console.error(error);
            return response.status(403).json({ general: 'Wrong credentials, please try again' });
        })
}

/*
This function is responsible for image upload to the database for user profile picture
using the busboy library which can be installed with the following command(in functions folder):
npm install --save busboy 
*/
exports.uploadImage = (request, response) => {
    const BusBoy = require('busboy');
    const path = require('path'); //default package in all node projects
    const os = require('os');
    const fs = require('fs');

    let imageFileName;
    let imageToBeUploaded = {};
    const busboy = new BusBoy({ headers: request.headers });
    busboy.on('file', (fieldname, file, filename, encoding, miemtype) => {
        console.log(fieldname);
        console.log(filename);
        console.log(miemtype);

        if (miemtype !== 'image/jpeg' && miemtype !== 'image/png') {
            return response.status(400).json({ error: 'Wrong file type submitted' }); // 400 = Client error: bad request
        }

        /*
            We need to get the filetype of the image png/jpeg etc...
            image.png => png

            To do that you can split the filename by '.' but the file can also be
            my.image.png

            Thats why you split it by '.' and since it returns an array and it does not mutate
            the original array you can split it again and ask for the new arrays length -1 
            and inputting that number in the array will get you the last part of the string => file type
            [my, image, png]
            filename.split('.').length -1 === 2
        */
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`; //new custom filename eg. => 971826348971234.png
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, miemtype };

        file.pipe(fs.createWriteStream(filepath)); //node.js method
    });
    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.miemtype
                }
            }
        })
            .then(() => {
                //you need to add alt=media to show image on the browser otherwise it would just download it to your computer
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;

                /*
                with firebaseAuthentication middleware we know that the user 
                signed in and only then he can upload an image and this way we also get the use
                */
                return db.doc(`/users/${request.user.handle}`).update({ imageUrl });
            })
            .then(() => {
                return response.json({ message: 'image uploaded successfully' });
            })
            .catch((error) => {
                console.error(error);
                return response.status(500).json({ error: error.code });
            });
    });
    busboy.end(request.rawBody);
}

/*
This function is responsible for uploading user info to the database like
bio, website, location
*/
exports.addUserDetails = (request, response) => {
    let userDetails = reduceUserDetails(request.body);
    db.doc(`/users/${request.user.handle}`).update(userDetails)
        .then(() => {
            return response.json({ message: 'Details added successfully' });
        })
        .catch((error) => {
            console.error(error);
            return response.status(500).json({ error: error.code });
        })
}

/*
This function is responsible for getting public user data in this format:
{
    "user": {
        "createdAt": "2021-01-23T09:41:07.701Z",
        "handle": "user1",
        "email": "user1@email.com",
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/socialmediaclone-c3756.appspot.com/o/no-image.png?alt=media",
        "userId": "yC1TQcHeUJgu8L853zMQ65OGXrJ3"
    },
    "screams": [
        {
            "body": "Loud scream 2",
            "createdAt": "2021-01-24T13:31:20.821Z",
            "userHandle": "user1",
            "userImage": "https://firebasestorage.googleapis.com/v0/b/socialmediaclone-c3756.appspot.com/o/no-image.png?alt=media",
            "likeCount": 0,
            "commentCount": 0,
            "screamId": "OEEFAYu6Eyu1hPv9T7vR"
        },
        {
            "body": "Loud scream",
            "createdAt": "2021-01-23T09:41:29.341Z",
            "userHandle": "user1",
            "userImage": "https://firebasestorage.googleapis.com/v0/b/socialmediaclone-c3756.appspot.com/o/no-image.png?alt=media",
            "likeCount": 1,
            "commentCount": 0,
            "screamId": "9N6o8PfW4p8vsuvWi4Ti"
        }
    ]
}
*/
exports.getUserDetails = (request, response) => {
    let userData = {};
    db.doc(`/users/${request.params.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.user = doc.data();
                return db.collection('screams').where('userHandle', '==', request.params.handle)
                    .orderBy('createdAt', 'desc')
                    .get();
            }
            else {
                return response.status(404).json({ error: 'User not found' });
            }
        })
        .then(data => {
            userData.screams = [];
            data.forEach(doc => {
                userData.screams.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    screamId: doc.id
                })
            });
            return response.json(userData);
        })
        .catch(error => {
            console.error(error);
            return response.status(500).json({ error: error.code });
        })
}

/*
This function is responsible for getting user credentials in this format:
{
    "credentials": {
        "email": "user@email.com",
        "handle": "user",
        "createdAt": "2021-01-18T10:14:36.396Z",
        "location": "london uk",
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/socialmediaclone-c3756.appspot.com/o/85985437846.jpg?alt=media",
        "bio": "biotest",
        "userId": "HyCuqctsXtWdhzDXIKpIVFevh9H3",
        "website": "http://user.com"
    },
    "likes": []
}
*/
exports.getAuthenticatedUser = (request, response) => {
    let userData = {};
    db.doc(`/users/${request.user.handle}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', request.user.handle).get();
            }
        })
        .then(data => {
            userData.likes = [];
            data.forEach(doc => {
                userData.likes.push(doc.data());
            });
            return db.collection('notifications').where('recipient', '==', request.user.handle)
                .orderBy('createdAt', 'desc').limit(10).get();
        })
        .then(data => {
            userData.notifications = [];
            data.forEach(doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    screamId: doc.data().screamId,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id,
                })
            })
            return response.json(userData);
        })
        .catch(error => {
            console.error(error);
            return response.status(500).json({ error: error.code });
        })
}

/*
This function is responsible for marking the notifications as read when user sees them
*/
exports.markNotificationsRead = (request, response) => {
    let batch = db.batch();
    request.body.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`);
        batch.update(notification, { read: true });
    });
    batch.commit()
        .then(() => {
            return response.json({ message: 'Notifications marked as read' });
        })
        .catch(error => {
            console.error(error);
            return response.status(500).json({ error: error.code });
        })
}


