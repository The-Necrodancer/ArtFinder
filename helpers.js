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

import {
    commentMinLength, 
    commentMaxLength
} from './data/reviews.js'; 
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

/**
 * Throws if the password isn't valid
 * @param {String} password Password to be checked
 * @returns {String} trimmed password
 */
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

/**
 * Throws if username isn't valid
 * @param {String} username Username to be checked
 * @returns {String} trimmed username
 */
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

/**
 * Throws if item key isn't valid 
 * @param {String} key Key to be checked
 * @returns trimmed key
 */
export const checkPricingInfoItem = (key) => {
    key = checkStringMinMax(key, 'key', pricingInfoItemMinLength, pricingInfoItemMaxLength); 
    //if(key.match(/\W|_/)) 
        //throw 'Error: name of item for sale can only contain alphanumeric characters.'; 
    return key; 
}

/**
 * Throws if value isn't a valid price
 * @param {Number} value Price of an item
 * @returns value
 */
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

/**
 * Throws if rating isn't a valid value
 * @param {Number} rating Rating of a review
 * @returns {Number} rating
 */
export const checkRating = (rating) => {
    if(typeof rating !== 'number') 
        throwWrongTypeError('rating', 'number', typeof rating); 
    if(rating<0) 
        throw 'Error: rating cannot be less than 0.';
    if(rating>5)
        throw 'Error: rating cannot be greater than 5.'; 
    return rating; 
}

/**
 * Throws if comment isn't valid 
 * @param {String} comment Comment of a review
 * @returns {String} trimmed comment 
 */
export const checkComment = (comment) => {
    return checkStringMinMax(comment, 'comment', commentMinLength, commentMaxLength); 
}

/**
 * Throws if title isn't valid
 * @param {String} title Title of a commission
 * @returns {String} trimmed title
 */
export const checkTitle = (title) =>{
    return checkStringMinMax(title, 'title', titleMinLength, titleMaxLength); 
}

/**
 * Throws if details isn't valid
 * @param {String} details Details of a commission
 * @returns 
 */
export const checkDetails = (details) => {
    return checkStringMinMax(details, 'details', detailsMinLength, detailsMaxLength); 
}

/**
 * Throws if status isn't a valid status
 * @param {String} status Status of a commission
 * @returns trimmed status
 */
export const checkStatus = (status) => {
    status = checkStringNaN(status); 
    if(!statusValues.includes(status)) throw `Error: ${status} is not a valid status.`; 
    return status; 
}

/**
 * Throws if bio isn't valid
 * @param {String} bio Bio of an artist's profile
 * @returns trimmed bio
 */
export const checkBio = (bio) => {
    return checkStringMinMax(bio, 'bio', bioMinLength, bioMaxLength); 
}

/**
 * Throws if tos isn't valid
 * @param {String} tos TOS of an artist's profile
 * @returns trimmed tos
 */
export const checkTos = (tos) => {
    return checkStringMinMax(tos, 'tos', tosMinLength, tosMaxLength); 
}

/**
 * Throws if role is not 'user', 'artist', or 'admin'
 * @param {String} role Role of user
 * @returns trimmed role
 */
export const checkRole = (role) => {
    role = checkString(role); 
    if(role !== 'user' && role !== 'artist' & role !== 'admin') throw `Error: ${role} is not a valid role.`; 
    return role; 
}

/**
 * Throws if email is not a valid email address
 * @param {String} email Email of user
 * @returns {String} Trimmed email
 */
export const checkEmail = (email) => {
    email = checkString(email); 
    if(!validateEmail(email)) throw `Error: email is not a valid email address.`; 
    return email; 
}

/**
 * Throws if string isn't a string, or it's length is less than min or greater than max
 * @param {String} string String to be checked
 * @param {String} varName name of string variable
 * @param {Number} min Min length of string
 * @param {Number} max Max length of string
 * @returns trimmed string
 */
const checkStringMinMaxNaN = (string, varName, min, max) => {
    string = checkStringMinMax(string, varName, min, max); 
    if(!isNaN(string)) throw `Error: ${varName} cannot be a number`; 
    return string;  
}

/**
 * Throws if string isn't valid, it's length is less than min, it's length is greater than max, or it's a number
 * @param {String} string String to be checked
 * @param {String} varName name of string variable
 * @param {Number} min Min length of string
 * @param {Number} max Max length of string
 * @returns trimmed string
 */
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