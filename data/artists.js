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
import {checkString, checkStringNaN, throwWrongTypeError, checkId, checkPricingInfoItem, checkPriceValue, checkTag, checkBio, checkTos} from '../helpers.js'; 
import { getAllUsers, getUserById } from "./users.js";

//exported variables:
export const bioMinLength = 0; 
export const bioMaxLength = 512; 

export const pricingInfoItemMinLength = 5; 
export const pricingInfoItemMaxLength = 32; 

export const tagMinLength = 5; 
export const tagMaxLength = 32; 

export const priceMinValue = 3; 
export const priceMaxValue = 150; 

export const tosMinLength = 0; 
export const tosMaxLength = 1024; 

 

export const getAllArtists = async() => {
    let users = await getAllUsers(); 
    uesrs = users.filter((user) => user.role === 'artist'); 
    return users; 
}; 

export const getArtistById = async(aid) => {
    aid =  checkId(aid); 
    let user = await getUserById(aid); 
    if(user.role !== 'artist') throw `Error: user is not an artist`; 
    user._id = user._id.toString(); 
    return user; 
}

export const updateArtistProfile = async(aid, newProfile) => {
    aid = checkId(aid); 
    let artist = await getArtistById(aid); 
    if (!newProfile || newProfile.constructor !== Object) {
        throwWrongTypeError('artist profile', 'object', typeof newProfile); 
    }
    const artistProfileKeys = ['bio', 'portfolio', 'pricingInfo', 'tags', 'availability', 'tos', 'rating'];
    for(const k of Object.keys(newProfile)) {
        if (!artistProfileKeys.includes(k)) {
            throw `Error: ${k} is not a valid artist profile key.`; 
        }
        if(k==='rating') {
            throw 'Error: you do not have permission to change the rating.'; 
        }
    }

    validatedObj = {}; 
    if('bio' in newProfile) {
        validatedObj.bio = checkBio(newProfile.bio); 
    }
    if('portfolio' in newProfile) {
        //validate images here 
    }
    if('pricingInfo' in newProfile) {
        if(newProfile.pricingInfo.constructor !== Object) {
            throwWrongTypeError('pricing info', 'Object', typeof newProfile.pricingInfo); 
        }
        validatedObj.pricingInfo = {}; 
        for (const [key, value] of Object.entries(newProfile.pricingInfo)) {
            key = checkPricingInfoItem(key);  
            value = checkPriceValue(value); 
            validatedObj.pricingInfo[key] = value; 
        }
    }

    if('tags' in newProfile) {
        if(!Array.isArray(newProfile.tags)) {
            throwWrongTypeError('tag list', 'Array', typeof tags); 
        }
        validatedObj.tags = []; 
        for(const t of newProfile.tags) {
            validatedObj.tags.push(checkTag(t)); 
        }
    }

    if('availability' in newProfile) {
        if(typeof newProfile.availability !== 'boolean') {
            throwWrongTypeError('availability', 'boolean', typeof newProfile.availability ); 
        }
        validatedObj.availability = newProfile.availability; 
    }

    if('tos' in newProfile) {
        if(typeof newProfile.tos !== 'string') {
            throwWrongTypeError('TOS', 'string', typeof newProfile.tos); 
        }
        validatedObj.tos = checkTos(newProfile.tos);  
    }

    let userCollection = await users(); 
    const updatedArtist = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(aid)}, 
        {$set: validatedObj},
        {ReturnDocument: "after"}
    ); 

    updatedArtist._id = updatedArtist._id.toString(); 
    delete updatedArtist.password; 
    return updatedArtist; 
};