import { createUser, getUserById, getAllUsers } from "../data/users.js";
import { ObjectId } from "mongodb";
import { faker} from "@faker-js/faker";
import lodash from 'lodash'; 
import { createRandomUser } from "./helper.js";

/**
 * Tests methods exported by ../data/users.js
 */
const testUserMethods = async () => {
    const totalNumUsers = 30; 
    let userList = await testCreateUser(totalNumUsers); 
    await testGetAllUsers(userList, totalNumUsers); 
    await testGetUserById(userList, totalNumUsers); 

    await testCreateUserBadInput(userList); 
    await testGetUserByIdBadInput(); 
}; 

/**
 * Tests that createUser() behaves as expected when given valid inputs. 
 * @param {number} totalNumUsers The number of user objects in the database. 
 * @returns An array of all users that have been added to the database. 
 */
const testCreateUser = async (totalNumUsers) => {
    const userList = []; 
    let hasErrors = false; 
    for(let i=0; i<totalNumUsers; i++) {
        let newUser = await createRandomUser();
        let insertedUserId; 
        try {
            insertedUserId = await createUser(newUser.role, newUser.username, newUser.email, newUser.password); 
        } catch (e) {
            console.log("FAILURE IN CREATEUSER"); 
            console.log("Attempted to insert ", newUser); 
            console.log("Error: ", e); 
            hasErrors = true; 
            continue; 
        }
        let insertedUser = await getUserById(insertedUserId);
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
        delete newUser.password; 
        userList.push(newUser); 
    }
    if(!hasErrors) {
        console.log("createUser passed all test cases."); 
    }
    return userList; 
}

/**
 * Tests that getAllUsers behaves as expected. 
 * @param {array} userList An array of all user objects that are in the database. 
 * @param {number} totalNumUsers The number of user objects in the database. 
 */
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

/**
 * Tests that getUserById() correctly handles all valid id inputs. 
 * @param {array} userList An array of all user objects that are in the database. 
 * @param {number} totalNumUsers The number of user objects in the database. 
 */
const testGetUserById = async(userList, totalNumUsers) => {
    let hasErrors = false; 
    for(let i=0; i<totalNumUsers; i++) {
        try {
            const returnedUser = await getUserById(userList[i]._id); 
            if(!lodash.isMatch(userList[i], returnedUser)) {
                hasErrors = true; 
                console.log("FALIURE IN GETUSERBYID");
                console.log("Attempted to get user ", userList[i]); 
                console.log("Received ", returnedUser); 
            }
        } catch (e) {
            console.log("FALIURE IN GETUSERBYID");
            console.log("Attempted to get user ", userList[i]); 
            console.log("Received error ", e); 
        }
    }
    if(!hasErrors) {
        console.log("getUserById passed all test cases.")
    }
}
/**
 * Tests that createUser() correctly throws when given bad input. 
 * @param {array} userList An array of all user objects that are in the database.
 */
const testCreateUserBadInput = async (userList) => {
    let hasErrors = false; 
    const badInputs = [
        [undefined], 
        [5, 'fake_username', 'fakeemail@gmail.com', 'passwd'], 
        [undefined, 'fake_username', 'fakeemail@gmail.com', 'passwd'], 
        [[5, 3], 'fake_username', 'fakeemail@gmail.com', 'passwd'], 
        ['  ', 'fake_username', 'fakeemail@gmail.com', 'passwd'], 
        ['corporate spy', 'fake_username', 'fakeemail@gmail.com', 'passwd'], 
        ['artist', undefined, 'fakeemail@gmail.com', 'passwd'], 
        ['artist', null, 'fakeemail@gmail.com', 'passwd'], 
        ['artist', {}, 'fakeemail@gmail.com', 'passwd'], 
        ['artist', ['username'], 'fakeemail@gmail.com', 'passwd'], 
        ['artist', '     ', 'fakeemail@gmail.com', 'passwd'], 
        ['artist', faker.helpers.arrayElement(userList).username, 'fakeemail@gmail.com', 'passwd'], 
        ['artist', faker.helpers.arrayElement(userList).username, 'fakeemail@gmail.com', 'passwd'],
        ['artist', faker.helpers.arrayElement(userList).username, 'fakeemail@gmail.com', 'passwd'],
        ['artist', faker.helpers.arrayElement(userList).username, 'fakeemail@gmail.com', 'passwd'],
        ['artist', 'fake_username', undefined, 'passwd'], 
        ['artist', 'fake_username', null, 'passwd'], 
        ['artist', 'fake_username', ['fakeemail@gmail.com'], 'passwd'], 
        ['artist', 'fake_username', 'email@gmail', 'passwd'],
        ['artist', 'fake_username', '     ', 'passwd'],
        ['artist', 'fake_username', 'fakeemail@gmail.com', undefined],  
        ['artist', 'fake_username', 'fakeemail@gmail.com', null],  
        ['artist', 'fake_username', 'fakeemail@gmail.com', {password: "passwd"}],  
        ['artist', 'fake_username', 'fakeemail@gmail.com', ["password"]], 
        ['artist', 'fake_username', 'fakeemail@gmail.com', ' '], 
        ['artist', 'fake_username', faker.helpers.arrayElement(userList).email, 'passwd'], 
        ['artist', 'fake_username', faker.helpers.arrayElement(userList).email, 'passwd'], 
        ['artist', 'fake_username', faker.helpers.arrayElement(userList).email, 'passwd'], 
        ['artist', 'fake_username', faker.helpers.arrayElement(userList).email, 'passwd']
    ]; 
    for(let i=0; i<badInputs.length; i++) {
        try { 
            await createUser(...badInputs[i]); 
            hasErrors = true; 
            console.log("Failed to throw for inputs ", badInputs[i]); 
        } catch (e) {
            
        }
    }
    if(!hasErrors) console.log("createUser successfully threw for all bad input test cases.");
}

/**
 * Test that getUserById() correctly throws when given bad input. 
 */
const testGetUserByIdBadInput = async () => {
    let hasErrors = false; 
    const badInputs = [
        undefined, 
        null, 
        '    ', 
        3, 
        ['id'], 
        {}, 
        'wedtysghcbj', 
        new ObjectId()
    ]
    for(let i=0; i<badInputs.length; i++) {
        try {
            await getUserById(badInputs[i]); 
            hasErrors = true; 
            console.log("getUserById failed to throw for input ", badInputs[i]); 
        } catch (e) {}
    }
    if(!hasErrors) console.log("getUserById successfuly threw for all bad input test cases."); 
}
export default testUserMethods; 
