const { user } = require("firebase-functions/lib/providers/auth");

//#region HELPERS
const isEmpty = function(string) {
    if (string.trim()===''){
        return true;
    }
    else{
        return false;
    }
}

const isEmail = function(email){
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)){
        return true;
    }
    else{
        return false
    }
}
//#endregion

exports.validateSignupData = (data) =>{
    let errors={};

    if(isEmpty(data.email)){
        errors.email='Must not be empty';
    }
    else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email';
    }

    if(isEmpty(data.password)){
        errors.password='Must not be empty';
    }

    if(data.confirmPassword!==data.password){
        errors.confirmPassword='Passwords must match';
    }

    if(isEmpty(data.handle)){
        errors.handle='Must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length===0 ? true : false
    }
}

exports.validateLoginData = (data) =>{
    let errors ={};
    if(isEmpty(data.email)){
        errors.email = 'Must not be empty';
    }

    if(isEmpty(data.password)){
        errors.password = 'Must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length===0 ? true : false
    }
}

/*
    This function reduces the users input for writing into database,
    when submitting a form, if the user doesnt input a location for example
    then we dont want to write that to the database, thats why with this functions
    we dont include it into the object that will be handled by addUserDetails function
*/
exports.reduceUserDetails = (data) =>{
    let userDetails = {};
    if(!isEmpty(data.bio.trim())){
        userDetails.bio= data.bio;
    }
    if(!isEmpty(data.website.trim())){
      //  https://website.com
      //checks if website doesnt start with http...
        if(data.website.trim().substring(0,4)!=='http'){ // the 4 is actually the p not the s in https ...wtf
            userDetails.website= `http://${data.website.trim()}`;
        } 
        else{
            userDetails.website=data.website;
        }
    }
        if(!isEmpty(data.location.trim())){
            userDetails.location = data.location;
        }

        return userDetails;
}