

/* 
    isArtist -> boolean, true if an artist
    isAdmin -> boolean, true if an admin 
    username -> string 
    email -> string 
    liked -> an array of post ids that the user has liked 
    commissionsCust -> an array of commission ids that the user has bought from someone else 
    commissionsSell -> an array of commission ids that the user is creating/ed for someone else 
        -> this should be uninitialized if isArtist is false 
    reviewsMade -> an array of review ids that the user has made
    reviewsReceived -> an array of review ids that the user has received 
        -> this should be uninitialized if isArtist is false 
    artistName -> name the artist uses 
        -> this should be uninitialized if isArtist is false 

    
*/ 
import { users } from '../config/mongoCollection.js';

import {checkString, checkStringNaN, validateEmail, throwWrongTypeError} from '../helpers.js'; 

export const createUser = async ( 
    isArtist, 
    isAdmin, 
    username,
    email, 
    artistName //optional 
) => {
    if(typeof isArtist != 'boolean') {
        throwWrongTypeError('isArtist', 'boolean', typeof(isArtist)); 
    }
    if(typeof isAdmin != 'boolean') {
        throwWrongTypeError('isAdmin', 'boolean', typeof(isAdmin)); 
    }
    username = checkStringNaN(username, 'username'); 

    email = checkString(email, 'email'); 
    if(!validateEmail(email)) {
        throw `Error: ${email} is not a valid email address.`
    }

    let newUser = {
        isArtist, 
        isAdmin, 
        username, 
        email, 
        liked: [], 
        commissionsCust: [], 
        reviewsMade: []
    }; 

    if(isArtist) {
        const newFields = {
            commissionsSell: [], 
            reviewsReceived: [], 
            artistName: checkStringNaN(artistName, "Artist's Name")
        }; 
        Object.assign(newUser, newFields); 
    }

    const userCollection = await users(); 
    const insertedUser = await userCollection.insertOne(newUser); 
    if(insertedUser.acknowledged != true || !insertedUser.insertedId) {
        throw `Error: could not create user ${username}.`
    }
    return await getUserById(insertedUser.insertedId.toString()); 
}

export const getUserById = async (id) => {

}; 