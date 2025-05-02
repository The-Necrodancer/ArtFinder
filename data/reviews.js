import { ObjectId } from "mongodb";
import { reviews, users } from '../config/mongoCollection.js';
import { getArtistById } from "./artists.js";
import { getUserById } from "./users.js";
import {getCommissionById } from '../commissions.js'; 
import { checkComment, checkId, checkRating } from "../helpers.js";

export const commentMinLength = 10; 
export const commentMaxLength = 512; 

export const createReview = async(cid, rating, comment) => { 
    rating = checkRating(rating); 
    comment = checkComment(comment); 

    //Following makes sure that all are valid and exist in databases 
    let com = await getCommissionById(cid); 
    let aid = com.aid; 
    let uid = com.uid; 
    let artist = await getArtistById(aid); 
    let user = await getUserById(uid);

    let reviewCollection = await reviews(); 
    let insertedReview = await reviewCollection.insertOne({cid, aid, uid, rating, comment}); 
    if(insertedReview.acknowledged != true || !insertedReview.insertedId) 
        throw 'Error: could not insert review in database'; 

    let rid = insertedReview.insertedId.toString(); 
    let userCollection = await users(); 

    //add review to artist 
    artist.artistProfile.reviewsReceived.push(rid); 
    const updatedArtist = await userCollection.updateOne(
        {_id: new ObjectId(aid)}, 
        {$set: {"artistProfile.reviewsReceived": artist.artistProfile.reviewsReceived}}
    ); 
    if(updatedArtist.matchedCount ===0 || updatedArtist.modifiedCount !== 1)
        throw `Error: could not add commission to artist.`; 

    //add review to user 
    user.reviewsGiven.push(rid); 
    const updatedUser = await userCollection.updateOne(
        {_id: new ObjectId(aid)}, 
        {$set: {'reviewsGiven': user.reviewsGiven}}
    ); 
    if(updatedUser.matchedCount ===0 || updatedUser.modifiedCount !== 1)
        throw `Error: could not add commission to artist.`; 

    return await getReviewById(insertedReview.insertedId.toString()); 
}

export const getReviewById = async(id) => {
    id = checkId(id); 
    const reviewCollection = await reviews(); 
    const review = await reviewCollection.findOne({_id: new ObjectId(id)}); 
    if (!review) throw `Error: review not found.`; 
    review._id = review._id.toString(); 
    return review; 
}