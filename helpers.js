// This file provides some basic and useful helper functions that we will need later on.
// Especially when it comes to working with the data.


import {ObjectId} from 'mongodb';
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