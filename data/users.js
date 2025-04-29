

/*
    role -> string, either 'user' 'artist' or 'admin' 
    username -> string 
    email -> string 
    password -> string 
    requestedCommisions  -> an array of commission ids that the user has bought from someone else 
    reviewsGiven -> an array of review ids that the user has made
    artistProfile -> obj 
        {
        bio -> string, artist bio 
        portfolio -> array of img strings 
        pricingInfo -> key-map value pair 
        tags -> array of strings 
        availability: -> boolean 
        tos -> string 
        rating -> 
        createdCommissions -> an array of commission ids that the user is creating/ed for someone else 
        reviewsReceived -> an array of review ids that the artist has received 
        }
*/ 
import { ObjectId } from "mongodb";
import { users } from '../config/mongoCollection.js';
import bcrypt from "bcrypt"; 

import {checkString, 
    checkStringNaN, 
    validateEmail, 
    validatePassword, 
    checkId, validateUsername} from '../helpers.js'; 

/**
 * Adds a user to the database. 
 * @param {string} role The role of the user, either 'user', 'admin', or 'artist'.
 * @param {string} username The username of the user.
 * @param {string} email The email of the user (must be in valid email format).
 * @param {string} password The password of the user.
 * @returns {obj} The user that was added. 
 */
export const createUser = async ( 
    role,  
    username,
    email, 
    password
) => {
    const userCollection = await users(); 
    role = checkString(role); 
    if (role !== 'user' && role !== 'artist' && role != 'admin') {
        throw `Error: given role ${role} is not either 'user', 'admin', or 'artist.`; 
    }
    username = validateUsername(username, 'username'); 
    if(await containsUsername(username)) throw `Error: username already taken.`;  
    password = validatePassword(password); 
    password = await bcrypt.hash(password, 10);

    email = checkString(email, 'email'); 
    if(!validateEmail(email)) {
        throw `Error: ${email} is not a valid email address.`
    }
    if(await containsEmail(email)) throw `Error: email already in use.`; 

    let newUser = {
        role, 
        username, 
        email, 
        password, 
        requestedCommissions: [], 
        reviewsGiven: []
    }; 

    if(role==='artist') {
        let artistProfile = {
            bio: "", 
            portfolio: [], 
            pricingInfo: {}, 
            tags: [],
            availability: false, 
            tos: "", 
            createdCommissions: [], 
            reviewsReceived: [], 
            rating: 0
        }; 
        Object.assign(newUser, {artistProfile}); 
    }

    const insertedUser = await userCollection.insertOne(newUser); 
    if(insertedUser.acknowledged != true || !insertedUser.insertedId) {
        throw `Error: could not create user ${username}.`
    }
    return await getUserById(insertedUser.insertedId.toString()); 
}

/**
 * Gets user with given id. 
 * @param {string} id Id of user to find (must be valid id of existing user).
 * @returns {obj} The user that has given id.
 */
export const getUserById = async (id) => {
    id = checkId(id); 
    const userCollection = await users(); 
    const user = await userCollection.findOne({_id: new ObjectId(id)}); 
    if (!user) throw `Error: user not found.`; 
    user._id = user._id.toString(); 
    return user; 
}; 

/**
 * Gets all users within the database. 
 * @returns An array of all users in the database.
 */
export const getAllUsers = async() => {
    const userCollection = await users(); 
    let userList = await userCollection.find({}).toArray(); 
    if(!userList) throw 'Error: Could not get all users.'; 
    userList = userList.map((usr) => {
        usr._id = usr._id.toString(); 
        return usr; 
    }); 
    return userList; 
};

/**
 * Finds whether username is in use. 
 * @param {string} username A username to check the database for.
 * @returns {boolean} True if username is in the database, false otherwise.
 */
export const containsUsername = async(username) => {
    username = validateUsername(username);
    const userCollection = await users(); 
    return (!(await userCollection.findOne({username})))? false : true;  
}

/**
 * Finds whether email is in use. 
 * @param {string} email A email to check the database for (must be in valid email format).
 * @returns {bool} True if email is in the database, false otherwise. 
 */
export const containsEmail = async(email) => {
    email = checkString(email); 
    if(!validateEmail(email)) throw 'Error: ${email} is not a valid email address.'; 
    const userCollection = await users(); 
    return (!( await userCollection.findOne({email})))? false : true;  
}

export const login = async (username, password) => {
    let userCollection = await users();
    username = validateUsername(username); 
    let user = await userCollection.findOne({username});
    if(!user) {
      throw "Either the username or password is invalid";
    }
    let actualPassword = user.password; 
    password = validatePassword(password); 
    if(!(await bcrypt.compare(password, actualPassword))) {
      throw "Either the userId or password is invalid";
    }
    delete user.password;
    return user; 
};