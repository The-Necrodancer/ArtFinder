/* artistProfile -> obj 
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
import {throwWrongTypeError, checkId, checkPricingInfoItem, checkPriceValue, checkTag, checkBio, checkTos} from '../helpers.js'; 
import { getAllUsers, getUserById } from "./users.js";

//exported variables:
export const bioMinLength = 0; 
export const bioMaxLength = 512; 

export const pricingInfoItemMinLength = 5; 
export const pricingInfoItemMaxLength = 32; 

export const tagMinLength = 2; 
export const tagMaxLength = 32; 

export const priceMinValue = 3; 
export const priceMaxValue = 150; 

export const tosMinLength = 0; 
export const tosMaxLength = 1024; 

//The list of keys that can be manually modiified using updateArtistProfile
export const artistProfileKeys = ['bio', 'portfolio', 'pricingInfo', 'tags', 'availability', 'tos'];

/**
 * Gets a list of all artists
 * @returns {Array} an array of all artists in database. 
 */
export const getAllArtists = async() => {
    let users = await getAllUsers(); 
    users = users.filter((user) => user.role === 'artist'); 
    return users; 
}; 

/**
 * Gets an artist by their id
 * @param {String} aid The artist's id
 * @returns {Object} The artist's user object
 */
export const getArtistById = async(aid) => {
    aid =  checkId(aid); 
    let user = await getUserById(aid); 
    if(user.role !== 'artist') throw `Error: user is not an artist`; 
    user._id = user._id.toString(); 
    return user; 
}

/**
 * Modifies the artist's profile in the database
 * @param {String} aid The artist's id
 * @param {Object} newProfile The profile of fields to update. 
 * @returns {Object} the updated artist object
 */
export const updateArtistProfile = async(aid, newProfile) => {
    aid = checkId(aid); 
    let artist = await getArtistById(aid); 
    //checks that newProfile is an Object
    if (!newProfile || newProfile.constructor !== Object) {
        throwWrongTypeError('artist profile', 'object', typeof newProfile); 
    }
    //checks that newProfile is not {}
    if(!Object.keys(newProfile).length) throw 'Error: newProfile cannot be empty.'; 
    //checks that newProfile only contains acceptable keys (see artistProfileKeys for lsit)
    for(const k of Object.keys(newProfile)) {
        if (!artistProfileKeys.includes(k)) {
            throw `Error: ${k} is not a valid modifiable artist profile key.`; 
        }
    }
    //object that will eventually contain only validated input 
    let validatedObj = {artistProfile: artist.artistProfile}; 
    //checks bio if in newProfile 
    if('bio' in newProfile) {
        validatedObj.artistProfile.bio = checkBio(newProfile.bio); 
    }
    //checks portfolio if in newProfile 
    if('portfolio' in newProfile) {
        if(!Array.isArray(newProfile.portfolio)) throwWrongTypeError('portfolio', 'Array', typeof newProfile.portfolio); 
        //validate images here 
    }
    //checks pricing info if in newProfile 
    if('pricingInfo' in newProfile) {
        //makes sure that field pricingInfo is an Object
        if(!newProfile.pricingInfo || newProfile.pricingInfo.constructor !== Object) {
            throwWrongTypeError('pricing info', 'Object', typeof newProfile.pricingInfo); 
        }
        //sets pricingInfo to empty to later add validated items and prices
        validatedObj.artistProfile.pricingInfo = {}; 
        //for every item and pricing given to this function, 
        //validates the input and then adds it to pricingInfo
        for (let [key, value] of Object.entries(newProfile.pricingInfo)) {
            //check that didn't submit duplicate keys: 
            if(Object.keys(validatedObj.artistProfile.pricingInfo).contains(key)) {
                throw `Error: cannot have duplicate keys.`; 
            }
            key = checkPricingInfoItem(key);  
            value = checkPriceValue(value); 
            validatedObj.artistProfile.pricingInfo[key] = value; 
        }
    }
    //checks tags if in newProfile 
    if('tags' in newProfile) {
        //makes sure given tags is correctly an array 
        if(!Array.isArray(newProfile.tags)) {
            throwWrongTypeError('tag list', 'Array', typeof tags); 
        }
        validatedObj.artistProfile.tags = []; 
        //validates every tag given 
        for(const t of newProfile.tags) {
            validatedObj.artistProfile.tags.push(checkTag(t)); 
        }
    }
    //checks availability if in newProfile 
    if('availability' in newProfile) {
        if(typeof newProfile.availability !== 'boolean') {
            throwWrongTypeError('availability', 'boolean', typeof newProfile.availability ); 
        }
        validatedObj.artistProfile.availability = newProfile.availability; 
    }
    //checks tos if in newProfile 
    if('tos' in newProfile) {
        if(typeof newProfile.tos !== 'string') {
            throwWrongTypeError('TOS', 'string', typeof newProfile.tos); 
        }
        validatedObj.artistProfile.tos = checkTos(newProfile.tos);  
    }
    //updates artist 
    let userCollection = await users(); 
    const updatedArtist = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(aid)}, 
        {$set: validatedObj},
        {returnDocument: "after"}
    ); 
    if(!updatedArtist) throw 'Error: could not update artist in database.'; 
    updatedArtist._id = updatedArtist._id.toString(); 
    delete updatedArtist.password;
    return updatedArtist; 
};