import { createUser, getUserById, getAllUsers } from "../data/users.js";

import bcrypt from 'bcrypt'; 
import lodash from 'lodash'; 
import { createRandomUser } from "../helpers.js";

const testUserMethods = async () => {
    const totalNumUsers = 30; 
    let userList = await testCreateUser(totalNumUsers); 
    await testGetAllUsers(userList, totalNumUsers); 
}; 

const testCreateUser = async (totalNumUsers) => {
    const userList = []; 
    let hasErrors = false; 
    for(let i=0; i<totalNumUsers; i++) {
        let newUser = await createRandomUser();
        let insertedUser; 
        try {
            insertedUser = await createUser(newUser.role, newUser.username, newUser.email, newUser.password); 
        } catch (e) {
            console.log("FAILURE IN CREATEUSER"); 
            console.log("Attempted to insert ", newUser); 
            hasErrors = true; 
        }
        newUser._id = insertedUser._id; 
        newUser.requestedCommissions = []; 
        newUser.reviewsGiven = []; 
        if(newUser.role === 'artist') {
            newUser.artistProfile = {
                bio: '',
                portfolio: [],
                pricingInfo: {},
                tags: [],
                availability: false,
                tos: '',
                createdCommissions: [],
                reviewsReceived: [],
                rating: 0
            }; 
        }
        if(!lodash.isMatch(newUser, insertedUser)) {
            hasErrors = true; 
            console.log("FAILURE IN CREATEUSER"); 
            console.log("Attempt: ", newUser); 
            console.log("Result: ", insertedUser);  
        }
        userList.push(newUser); 
    }
    if(!hasErrors) {
        console.log("createUser passed all test cases."); 
    }
    return userList; 
}

const testGetAllUsers = async (userList, totalNumUsers) => {
    const returnedList = await getAllUsers(); 
    let hasErrors=false; 
    for(let i=0; i<totalNumUsers; i++) {
        if(!returnedList.find((usr) => {return lodash.isMatch(usr, userList[i]);} )) {
            console.log("FAILURE IN GETALLUSERS"); 
            console.log("Missing user: ", userList[i]); 
            hasErrors=true;
        }
    }
    for(let i=0; i<returnedList.length; i++) {
        if(!userList.find((usr) => {return lodash.isMatch(usr, returnedList[i]);} )) {
            console.log("FAILURE IN GETALLUSERS"); 
            console.log("Extra user: ", usr); 
            hasErrors=true;
        }
    }
    if(!hasErrors) {
        console.log("getAllUsers passed test case."); 
    }
}

export default testUserMethods; 
