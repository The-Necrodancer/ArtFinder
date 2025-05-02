// This file provides some basic and useful helper functions that we will need later on.
// Especially when it comes to working with the data.


import {ObjectId} from 'mongodb';
import { 
    detailsMaxLength, 
    detailsMinLength, 
    titleMinLength, 
    titleMaxLength,
    statusValues 
} from './data/commissions.js';
import { 
    bioMinLength,
    bioMaxLength, 
    pricingInfoItemMinLength, 
    pricingInfoItemMaxLength, 
    priceMinValue, 
    priceMaxValue, 
    tagMinLength, 
    tagMaxLength, 
    tosMinLength, 
    tosMaxLength
 } from './data/artists.js';

import {
    usernameMinLength, 
    usernameMaxLength, 
    passwordMinLength, 
    passwordMaxLength
} from './data/users.js'
// Note to Self: Remember to npm init and npm install mongodb
// Note to Self: Remember to npm install express-validator

// checkString has a return value, and that's just the str
export const checkString = (str, name) => { 
    /* Functionality:
    1. Check if the input is given
    2. Check if the input is a string
    3. TRIM the string
    4. Check if the input is not an empty string or a string with just spaces
    */

    if (!str) {
        throw `You must supply a ${name}!`;
    }
    if (!(typeof str === 'string')) {
        throw `${name} must be a string!`;
    }
    str = str.trim();
    if (str.length === 0) {
      throw `${name} cannot be an empty string / string with just spaces`;
    }
    return str;
}

// checks a mongodb ObjectId
export const checkId = (id) => {
    /* Functionality:
    1. Pass the id to checkString function
    2. Check if the input is a valid ObjectId
    */
    id = checkString(id, 'ID');
    if (!ObjectId.isValid(id)) {
        throw 'Error: invalid object ID';
    }
    return id;
}

// Basically checkString but also checks if the string is a number
export const checkStringNaN = (str, name) => {
    /* Functionality:
    1. Check if the input is given
    2. Check if the input is a string
    3. TRIM the string
    4. Check if the input is not an empty string or a string with just spaces
    5. Check if the input is a number (NaN)
    */

    str = checkString(str, name);
    if (!isNaN(str)) {
        throw `${name} must NOT be a number!`;
    }
    return str;
}

export const validateEmail = (email) => {
    /* Functionality:
    * Returns true if the email is valid, false otherwise
    */
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    // This regex is from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
};

export const checkTag = (tag) => {
    /* We'll discuss this more after our Database proposal*/ 
    tag = checkStringMinMax(tag, 'Tag', tagMinLength, tagMaxLength);

    /*
    * Should the tags be all lowercase? Or should there be a mix of cases?
    * - Owen
    */
    tag = tag.toLowerCase(); // Convert to lowercase

    // A valid tag can only be a string of letters, numbers, and underscores
    const specialCharRegex = /[^a-zA-Z0-9-\s]/;
    
    if (specialCharRegex.test(tag)) {
        throw 'Tag can only contain letters, numbers, hyphens, and underscores!';
    }
    return tag;
}

export const throwWrongTypeError = (varName, expected, received) => {
    throw `Error: ${varName} expected type ${expected} but received type ${received}.\n`
}

export const checkPassword = (password) => {
    password = checkStringMinMaxNaN(password, 'password', passwordMinLength, passwordMaxLength);
    if(password.match(/\s/)) 
        throw `Error: password cannot contain whitespace.`; 
    if(!password.match(/[A-Z]/))
        throw 'Error: password must contain at least one upper case letter.'; 
    if(!password.match(/\d/)) 
        throw 'Error: password must contain at least one number.'; 
    if(!password.match(/[^\w\d]|_/)) 
        throw 'Error: password must contain at least one special character.'; 
    return password; 
}


export const checkUsername = (username) => {
    username = checkStringMinMaxNaN(username, 'username', usernameMinLength, usernameMaxLength); 
    if (username.match(/\s/))
        throw "Error: username cannot contain whitespace"; 
    /*
    if (username.match(/\W/))
        throw "Error: username can only contain alphanumeric characters and underscores"; 
    */
    return username; 
}


export const checkPricingInfoItem = (key) => {
    key = checkStringMinMax(key, 'key', pricingInfoItemMinLength, pricingInfoItemMaxLength); 
    //if(key.match(/\W|_/)) 
        //throw 'Error: name of item for sale can only contain alphanumeric characters.'; 
    return key; 
}

export const checkPriceValue = (value) => {
    if(typeof value !== 'number') {
        throwWrongTypeError('price of item for sale', 'number', typeof value); 
    }
    if(value < priceMinValue) 
        throw `Error: the price of an item must be at least $3.`; 
    if (value > priceMaxValue) 
        throw `Error: the price of an item cannot exceed $150.`; 
    if(value.toString().match(/.\d{3}$/)) 
        throw 'Error: only two decimal digits are allowed.'; 
    return value; 
}

export const checkRating = (rating) => {
    if(typeof rating !== 'number') 
        throwWrongTypeError('rating', 'number', typeof rating); 
    if(rating<0) 
        throw 'Error: rating cannot be less than 0.';
    if(rating>5)
        throw 'Error: rating cannot be greater than 5.'; 
    return rating; 
}

export const checkComment = (comment) => {
    return checkStringMinMax(comment, 'comment', commentMinLength, commentMaxLength); 
}

export const checkTitle = (title) =>{
    return checkStringMinMax(title, 'title', titleMinLength, titleMaxLength); 
}

export const checkDetails = (details) => {
    return checkStringMinMax(details, 'details', detailsMinLength, detailsMaxLength); 
}

export const checkStatus = (status) => {
    status = checkStringNaN(status); 
    if(!statusValues.includes(status)) throw `Error: ${status} is not a valid status.`; 
    return status; 
}

export const checkBio = (bio) => {
    return checkStringMinMax(bio, 'bio', bioMinLength, bioMaxLength); 
}

export const checkTos = (tos) => {
    return checkStringMinMax(tos, 'tos', tosMinLength, tosMaxLength); 
}


const checkStringMinMaxNaN = (string, varName, min, max) => {
    string = checkStringMinMax(string, varName, min, max); 
    if(!isNaN(string)) throw `Error: ${varName} cannot be a number`; 
    return string;  
}

const checkStringMinMax = (string, varName, min, max) =>  {
    if (typeof string !== 'string') throw `Error: ${varName} must be a string`;
    if (string.length !== 0) {
        string = string.trim(); 
        if(!isNaN(string)) throw `Error: ${varName} cannot be a number`; 
    }
    if(string.length < min) throw `Error: ${varName} must contain at least ${min} characters.`; 
    if(string.length > max) throw `Error: ${varName} cannot contain more than ${max} characters.`
    return string; 
}