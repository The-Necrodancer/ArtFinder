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