const {db, admin} = require('../utility/admin');
const {config} = require('../utility/config');
const firebase = require('firebase');
const {validateSignupData, validateLoginData} = require('../utility/validators');

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
//#region Signup
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

    const noImg='no-image.png';

    let userId, token;
    db.doc(`/users/${newUser.handle}`) //try to access the just created user document if it exists
    .get()
    .then(doc => {
        if(doc.exists){
            return response.status(400).json({handle: 'this handle is already taken'})
        }
        else{
            return firebase.auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)

        }
    })
    .then(data=>{
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
//#endregion

/**
 This function is responsible for user authentication into the system
 The request parameter recieves the following data:
 {
     Email
     password
 }
 */
//#region login
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
//#endregion

/*
This function is responsible for image upload to the database for user profile picture
using the busboy library which can be installed with the following command(in functions folder):
npm install --save busboy 
*/
//#region uploadImage
exports.uploadImage = (request, response) =>{
    const BusBoy = require('busboy');
    const path = require('path'); //default package in all node projects
    const os = require('os');
    const fs = require('fs');

    let imageFileName;
    let imageToBeUploaded = {};
    const busboy= new BusBoy({headers: request.headers});
    busboy.on('file', (fieldname, file, filename, encoding, miemtype)=>{
        console.log(fieldname);
        console.log(filename);
        console.log(miemtype);
        
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
        const imageExtension = filename.split('.')[filename.split('.').length -1];
        imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`; //new custom filename eg. => 971826348971234.png
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = {filepath, miemtype};

        file.pipe(fs.createWriteStream(filepath)); //node.js method
    });
        busboy.on('finish', ()=>{
            admin.storage().bucket().upload(imageToBeUploaded.filepath, {
                resumable:false,
                metadata:{
                    metadata:{
                        contentType: imageToBeUploaded.miemtype
                    }
                }
        })
        .then(()=>{
            //you need to add alt=media to show image on the browser otherwise it would just download it to your computer
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`; 
            
            /*
            with firebaseAuthentication middleware we know that the user 
            signed in and only then he can upload an image and this way we also get the use
            */
            return db.doc(`/users/${request.user.handle}`).update({imageUrl}); 
        })
        .then(()=>{
            return response.json({message: 'image uploaded successfully'});
        })
        .catch((error) =>{
            console.error(error);
            return response.status(500).json({error:error.code});
        });
    });
    busboy.end(request.rawBody);
}

//#endregion