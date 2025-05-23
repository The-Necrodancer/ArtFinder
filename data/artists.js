/* artistProfile -> obj 
    {
    bio -> string, artist bio 
    portfolio -> array of img strings 
    pricingInfo -> key-map value pair 
    tags -> array of strings 
    availability: -> boolean 
    tos -> string 
    rating -> float
    createdCommissions -> an array of commission ids that the user is creating/ed for someone else 
    reviewsReceived -> an array of review ids that the artist has received 
    cid -> card id 
    }
*/
import { ObjectId } from "mongodb";
import { users } from '../config/mongoCollection.js';
import {throwWrongTypeError, checkId, checkPricingInfoItem, checkPriceValue, checkTag, checkBio, checkTos, checkImageUrl, checkTagList} from '../helpers.js'; 
import { getAllUsers, getUserById } from "./users.js";
import { createCard, updateCardArtistProfile } from "./cards.js";

//exported variables:
export const bioMinLength = 0; 
export const bioMaxLength = 512; 

export const pricingInfoItemMinLength = 5; 
export const pricingInfoItemMaxLength = 32; 

export const tagMinLength = 2; 
export const tagMaxLength = 32; 

export const possibleTagsList = [
"2D",
"3D",
"Abstract",
"Animals",
"Anime",
"Architecture",
"Black/White",
"Calligraphy",
"Caricature",
"Cartoon",
"Chibi",
"Classical",
"Comic",
"Concept Art",
"Cyberpunk",
"Doodle",
"Fan Art",
"Fantasy",
"Fashion",
"Food & Drink",
"Game",
"Gothic",
"Graffiti",
"Historical",
"Horror",
"Isometric",
"Mythology",
"Nature",
"Pixel Art",
"Pop",
"Post-Apocalytic",
"Realistic",
"Retro",
"Sci-Fi",
"Sketch",
"Sports",
"Steampunk",
"Technical"];

export const lowerCaseTags = possibleTagsList.map(str => str.toLowerCase());

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
 * Gets all artists that have a tag
 * @param {String} tag The search tag
 * @returns {Array} The array of artists that have the search tag.
 */
export const getArtistsByTag = async(tag) => {
    let artists = await getAllArtists();
    let result = [];
    tag = checkTag(tag);
    for (let artist of artists)
        if(artist.tags.includes(tag))
            result.push(artist);
    return result; 
}

/**
 * Gets artists by all the tags
 * @param {String} tagArray The array of search tags.
 * @returns {Array} An ordered array of artists by the tags.
 */
export const getArtistsByTags = async(tagArray) => {
    let artists = await getAllArtists();
    let result = [];
    for (let artist of artists) {
        let count = 0;
        for (let tag of tagArray) {
            tag = checkTag(tag);
            if(artist.tags.includes(tag))
                count = count+1;
        }
        result.push({
            object: artist,
            tagsMatched: count
        });
    }
    result.sort((a, b) => b.tagsMatched - a.tagsMatched);
    return result; 
};

/**
 * Gets artists in an ordered list of the number of commissions accepted.
 * @returns {Array} An ordered array of artists by the commissions accepted.
 */
export const getArtistsByCommissions = async() => {
    let artists = await getAllArtists();
    let result = [];
    for (let artist of artists) {
        let count = artist.createdCommissions.length;
        result.push({
            object: artist,
            commissionCount: count
        });
    }
    result.sort((a, b) => b.commissionCount - a.commissionCount);
    return result; 
};

/**
 * Gets artists in an ordered list based on rating.
 * @returns {Array} An ordered array of artists by their ratings.
 */
export const getArtistsByRating = async() => {
    let artists = await getAllArtists();
    let result = [];
    for (let artist of artists) {
        let count = artist.rating;
        result.push({
            object: artist,
            rating: count
        });
    }
    result.sort((a, b) => b.rating - a.rating);
    return result; 
}

/**
 * Gets artists by all the tags
 * @param {String} lowPrice The low end of the price filter.
 * @param {String} highPrice The high end of the price filter.
 * @param {String} lowRating The low end of the rating filter.
 * @param {String} highRating The high end of the rating filter.
 * @param {String} availability The availability status of the filter.
 * @returns {Array} An array of artists that match the filters provided.
 */
export const filterArtists = async(lowPrice, highPrice, lowRating, highRating, availability) => {
    let artists = await getAllArtists();
    let result = [];
    for (let artist of artists) {
        let pass = false;
        if(artist.availability === availability) { // Availability
            if (artist.rating >= lowRating && artist.rating <= highRating) { // Rating
                for (let price in artist.pricingInfo) {
                    if (artist.pricingInfo[price] >= lowPrice && artist.pricingInfo[price] <= highPrice) { // Any singular item is within the range
                        pass = true;
                    }
                }
            }
        }
        if (pass) {
            result.push(artist);
        }
    }
    return result; 
}


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
        for(let i=0; i<newProfile.portfolio.length; i++) {
            newProfile.portfolio[i] = checkImageUrl(newProfile.portfolio[i]); 
        }
        validatedObj.artistProfile.portfolio = newProfile.portfolio; 
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
            if(Object.keys(validatedObj.artistProfile.pricingInfo).includes(key)) {
                throw `Error: cannot have duplicate keys.`; 
            }
            key = checkPricingInfoItem(key);  
            value = checkPriceValue(value); 
            validatedObj.artistProfile.pricingInfo[key] = value; 
        }
    }
    //checks tags if in newProfile 
    if('tags' in newProfile) {
        validatedObj.artistProfile.tags = checkTagList(newProfile.tags);
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
    console.log(validatedObj.artistProfile.cid);
    const updatedArtist = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(aid)}, 
        {$set: validatedObj},
        {returnDocument: "after"}
    ); 
    if(!updatedArtist) throw 'Error: could not update artist in database.'; 
    updatedArtist._id = updatedArtist._id.toString(); 
    await updateCardArtistProfile(updatedArtist._id); 
    delete updatedArtist.password;
    return updatedArtist; 
};


/**
 *  A wrapper function for updateArtistProfile (therefore error checking is done by other functions)
 * @param {String} aid The artist's aid
 * @param {Array of Strings} portfolio A list of images to add 
 */
export const addPhotosToPortfolio = async(aid, portfolio) => {
    const artist = await getArtistById(aid); 
    const newPortfolio = [...artist.artistProfile.portfolio, ...portfolio]; 
    return await updateArtistProfile(aid, {portfolio: newPortfolio}); 
}