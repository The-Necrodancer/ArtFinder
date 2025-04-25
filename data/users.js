

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

import {checkString, checkStringNaN, validateEmail, throwWrongTypeError, checkId} from '../helpers.js'; 

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
    username = checkStringNaN(username, 'username'); 
    if(containsUsername(username)) throw `Error: username already taken.`;  
    password = checkStringNaN(password, 'password'); 
    email = checkString(email, 'email'); 
    if(!validateEmail(email)) {
        throw `Error: ${email} is not a valid email address.`
    }
    if(containsEmail(email)) throw `Error: email already in use.`; 

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

export const getUserById = async (id) => {
    id = checkId(id); 
    const userCollection = await users(); 
    const user = await userCollection.findOne({_id: new ObjectId(id)}); 
    if (!user) throw `Error: user not found.`; 
    user._id = user._id.toString(); 
    return user; 
}; 


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

export const containsUsername = async(username) => {
    username = checkString(username);
    const userCollection = await users(); 
    return (!(await userCollection.find({username})))? false : true;  
}

export const containsEmail = async(email) => {
    email = checkString(email); 
    if(!validateEmail(email)) throw 'Error: ${email} is not a valid email address.'; 
    const userCollection = await users(); 
    return (!(await userCollection.find({email})))? false : true;  
}