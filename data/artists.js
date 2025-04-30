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
import {checkString, checkStringNaN, throwWrongTypeError, checkId, validateItemKey, checkPriceValue, validateTag} from '../helpers.js'; 
import { getAllUsers, getUserById } from "./users.js";

const artistProfileKeys = [bio, portfolio, pricingInfo, tags, availability, tos, rating, createdCommissions, reviewsReceived]; 

export const getAllArtists = async() => {
    let users = await getAllUsers(); 
    users.filter((user) => user.role === 'artist'); 
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
        if(typeof newProfile.bio !== 'string') 
            throwWrongTypeError('bio', 'string', typeof newProfile.bio); 
        if(newProfile.bio !== '')
            validatedObj.bio = newProfile.bio.trim(); 
        else 
            validatedObj.bio = ''; 
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
            key = validateItemKey(key);  
            value = checkPriceValue(value); 
            validatedObj.pricingInfo[`${key}`] = value; 
        }
    }

    if('tags' in newProfile) {
        if(!Array.isArray(newProfile.tags)) {
            throwWrongTypeError('tag list', 'Array', typeof tags); 
        }
        validatedObj.tags = []; 
        for(const t of newProfile.tags) {
            validatedObj.tags.push(validateTag(t)); 
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
        if(newProfile.tos.length > 256) 
            throw 'Error: TOS cannot exceed 256 characters in length.'; 
        validatedObj.tos = newProfile.tos; 
    }

    if('createdCommissions' in newProfile) {
        if(!Array.isArray(newProfile.createdCommissions)) {
            throwWrongTypeError("created comissions", 'array', typeof newProfile.createdCommissions); 
        }
        validatedObj.createdCommissions = []; 
        for (let cid of newProfile.createdCommissions) {
            cid = checkId(cid); 
            /* 
            if(!(await getCommissionById(cid))) {
                throw 'Error: no commission exists with given ID.';
            
            }
            */
            validatedObj.createdCommissions.push(cid); 
        }
    }

    if('reviewsReceived' in newProfile) {
        if(!Array.isArray(newProfile.reviewsReceived)) {
            throwWrongTypeError("created comissions", 'array', typeof newProfile.reviewsReceived); 
        }
        validatedObj.reviewsReceived = []; 
        let ratingSum = 0; 
        let numRating = 0; 
        for (let rid of newProfile.reviewsReceived) {
            rid = checkId(rid); 
            /*
            let review = await getReviewById(rid); 
            if(!review) {
                throw 'Error: no review exists with given ID.';
            }
            ratingSum += review.rating; 
            numRating++; 
            */
           validatedObj.reviewsReceived.push(cid); 
        }
        validatedObj.rating = (numRating != 0) ? ratingSum/numRating : 0; 
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

export const addReview = async(aid, rid) => {
    rid = checkId(rid); 
    let reviews = artist.reviews.push(rid); 
    return await updateArtistProfile(aid, {reviews}); 
}

export const addCommission = async(aid, cid) => {
    cid = checkId(cid); 
    let commissions = artist.commissions.push(cid); 
    return await updateArtistProfile(aid, cid); 
}

