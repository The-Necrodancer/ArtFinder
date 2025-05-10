import { ObjectId } from "mongodb";
import { reviews, users } from '../config/mongoCollection.js';
import { getArtistById } from "./artists.js";
import { getUserById } from "./users.js";
import {getCommissionById } from './commissions.js'; 
import { checkComment, checkId, checkRating } from "../helpers.js";

export const commentMinLength = 10; 
export const commentMaxLength = 512; 

/**
 * Creates a review in database and then returns it
 * @param {String} cid Commission that is being reviewed
 * @param {Number} rating Rating being made
 * @param {Comment} comment Comment being made
 * @returns {Object} Review object that was added to database
 */
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

    //make sure review hasn't already been made by user for given commission 
    if(user.requestedCommissions.find((e) => e._id === cid)) {
        throw 'Error: user has already made a review for this commission'; 
    }

    //creates new array w/ added review
    artist.artistProfile.reviewsReceived.push(rid); 
    //recalculates artist's average rating 
    let num = artist.artistProfile.reviewsReceived.length; 
    let avg = rating; 
    if(num>1) {
        avg = artist.artistProfile.rating * ((num-1)/num) + rating/num; 
    }

    //add review and updated rating to artist
    const updatedArtist = await userCollection.updateOne(
        {_id: new ObjectId(aid)}, 
        {$set: {
            "artistProfile.reviewsReceived": artist.artistProfile.reviewsReceived, 
            'artistProfile.rating': avg
        }}
    ); 
    if(updatedArtist.matchedCount ===0 || updatedArtist.modifiedCount !== 1)
        throw `Error: could not add commission to artist.`; 

    //add review to user 
    user.reviewsGiven.push(rid); 
    const updatedUser = await userCollection.updateOne(
        {_id: new ObjectId(uid)}, 
        {$set: {'reviewsGiven': user.reviewsGiven}}
    ); 
    if(updatedUser.matchedCount ===0 || updatedUser.modifiedCount !== 1)
        throw `Error: could not add commission to artist.`; 

    return await getReviewById(insertedReview.insertedId.toString()); 
}

/**
 * Gets review with given ID 
 * @param {String} id Id of review
 * @returns {Object} Review with given ID
 */
export const getReviewById = async(id) => {
    id = checkId(id); 
    const reviewCollection = await reviews(); 
    const review = await reviewCollection.findOne({_id: new ObjectId(id)}); 
    if (!review) throw `Error: review not found.`; 
    review._id = review._id.toString(); 
    return review; 
}

// UNTESTED
/**
 * Gets all reviews for a given commission
 * @param {String} cid Id of commission
 */
export const getReviewsByCommissionId = async(cid) => {
    cid = checkId(cid);
    const reviewCollection = await reviews();
    const reviewList = await reviewCollection.find({cid: cid}).toArray();
    if (!reviewList) throw `Error: Could not get all reviews.`;
    reviewList = reviewList.map((review) => {
        review._id = review._id.toString(); 
    });
    return reviewList;
}
