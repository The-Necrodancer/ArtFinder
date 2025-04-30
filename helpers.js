// This file provides some basic and useful helper functions that we will need later on.
// Especially when it comes to working with the data.


import {ObjectId} from 'mongodb';
import {faker} from '@faker-js/faker'; 
import bcrypt from 'bcrypt';
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

export const validateTag = (tag) => {
    /* We'll discuss this more after our Database proposal*/ 
    tag = checkString(tag, 'Tag');

    /*
    * Should the tags be all lowercase? Or should there be a mix of cases?
    * - Owen
    */
    tag = tag.toLowerCase(); // Convert to lowercase

    // A valid tag can only be a string of letters, numbers, and underscores
    const specialCharRegex = /[^a-zA-Z0-9\s]/;
    if (specialCharRegex.test(tag)) {
        throw 'Tag can only contain letters, numbers, and underscores!';
    }
    return tag;
}

export const throwWrongTypeError = (varName, expected, received) => {
    throw `Error: ${varName} expected type ${expected} but received type ${received}.\n`
}

export const createRandomUser = async() => {
    return {
        role: faker.helpers.arrayElement(['user', 'artist', 'admin']),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: await bcrypt.hash(faker.internet.password(), 10)  
    }
}
export const passwordMinLength = 8; 
export const passwordMaxLength = 64; 
export const validatePassword = (password) => {
    password = checkStringNaNMinMax(password, 'password', passwordMinLength, passwordMaxLength);
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

export const usernameMinLength = 5; 
export const usernameMaxLength = 20; 
export const validateUsername = (username) => {
    username = checkStringNaNMinMax(username, 'username', usernameMinLength, usernameMaxLength); 
    if (username.match(/\s/))
        throw "Error: username cannot contain whitespace"; 
    if (username.match(/\W/))
        throw "Error: username can only contain alphanumeric characters and underscores"; 
    return username; 
}

export const keyMinLength = 5; 
export const keyMaxLength = 32; 
export const validateItemKey = (key) => {
    key = checkStringNaNMinMax(key, 'key', keyMinLength, keyMaxLength); 
    if(key.match(/\W|_/))
        throw 'Error: name of item for sale can only contain alphanumeric characters.'; 
    return key; 
}


export const priceMinValue = 3; 
export const priceMaxValue = 150; 
export const checkPriceValue = (value) => {
    if(typeof value !== 'number') {
        throwWrongTypeError('price of item for sale', 'number', typeof value); 
    }
    if(value < priceMinValue) 
        throw `Error: the price of an item must be at least $3.`; 
    if (value > priceMaxValue) 
        throw `Error: the price of an item cannot exceed $150.`; 
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

export const commentMinLength = 10; 
export const commentMaxLength = 512; 
export const checkComment = (comment) => {
    return checkStringNaNMinMax(comment, 'comment', commentMinLength, commentMaxLength); 
}

export const titleMinLength = 5; 
export const titleMaxLength = 128; 
export const checkTitle = (title) =>{
    return checkStringNaNMinMax(title, 'title', titleMinLength, titleMaxLength); 
}

export const detailsMinLength = 32; 
export const detailsMaxLength = 1024; 
export const checkDetails = (details) => {
    return checkStringNaNMinMax(details, 'details', detailsMinLength, detailsMaxLength); 
}

const checkStringNaNMinMax = (string, varName, min, max) => {
    string = checkStringNaN(string, varName); 
    if(string.length < min) throw `Error: ${varName} must contain at least ${min} characters.`; 
    if(string.length > max) throw `Error: ${varName} cannot contain more than ${max} characters.`
    return string; 
}