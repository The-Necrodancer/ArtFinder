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
export const createReview = async (cid, rating, comment) => {
    rating = checkRating(rating);
    comment = checkComment(comment);

    // Validate and fetch related data
    const com = await getCommissionById(cid);
    const aid = com.aid;
    const uid = com.uid;

    // Check if the user has already reviewed this artist
    const existingReviews = await reviews();
    const existingReview = await existingReviews.findOne({ aid, uid });
    if (existingReview) {
        throw "Error: You have already reviewed this artist. Please update your existing review.";
    }

    // Proceed with creating the review
    const reviewCollection = await reviews();
    const insertedReview = await reviewCollection.insertOne({ cid, aid, uid, rating, comment });
    if (!insertedReview.acknowledged || !insertedReview.insertedId) {
        throw "Error: Could not insert review in database.";
    }

    const rid = insertedReview.insertedId.toString();

    // Update the artist's reviewsReceived array and recalculate the rating
    const artist = await getArtistById(aid);
    artist.artistProfile.reviewsReceived.push(rid);
    const num = artist.artistProfile.reviewsReceived.length;
    let avg = rating;
    if (num > 1) {
        avg = artist.artistProfile.rating * ((num - 1) / num) + rating / num;
    }
    avg = parseFloat(avg.toFixed(2));

    const userCollection = await users();
    const updatedArtist = await userCollection.updateOne(
        { _id: new ObjectId(aid) },
        {
            $set: {
                "artistProfile.reviewsReceived": artist.artistProfile.reviewsReceived,
                "artistProfile.rating": avg,
            },
        }
    );

    if (updatedArtist.matchedCount === 0 || updatedArtist.modifiedCount !== 1) {
        throw `Error: Could not update artist with ID ${aid}.`;
    }

    // Add the review to the user's reviewsGiven array
    const user = await getUserById(uid);
    user.reviewsGiven.push(rid);
    const updatedUser = await userCollection.updateOne(
        { _id: new ObjectId(uid) },
        { $set: { reviewsGiven: user.reviewsGiven } }
    );

    if (updatedUser.matchedCount === 0 || updatedUser.modifiedCount !== 1) {
        throw "Error: Could not add review to user.";
    }

    const a = await updateCommissionReviewStatus(cid, true);

    return await getReviewById(insertedReview.insertedId.toString());
};

/**
 * Updates review with given ID
 * @param {String} id Id of review
 * @param {rating} rating Updated rating
 * @param {comment} comment Updated comment
 * @returns {Object} Updated review with given ID
 */
export const updateReview = async(id, rating, comment) => { 
    rating = checkRating(rating); 
    comment = checkComment(comment); 
    id = checkId(id);

    const reviewCollection = await reviews(); 
    const review = await reviewCollection.findOne({_id: new ObjectId(id)}); 
    if (!review) throw `Error: review not found.`; 

    //Following makes sure that all are valid and exist in databases 
    let prevRating = review.rating;
    let cid = review.cid;
    let aid = review.aid; 
    let uid = review.uid; 
    let artist = await getArtistById(aid); 
    let user = await getUserById(uid);

    const updatedReview = {cid, aid, uid, rating, comment}

    let editedReview = await reviewCollection.findOneAndUpdate({_id: new ObjectId(id)}, {$set: updatedReview}, {returnDocument: "after"});
    if(editedReview.acknowledged != true || !editedReview.insertedId) 
        throw 'Error: could not insert review in database'; 

    let rid = insertedReview.insertedId.toString(); 
    let userCollection = await users(); 

    //recalculates artist's average rating 
    let num = artist.artistProfile.reviewsReceived.length; 
    let avg = rating; 
    if(num>1) {
        avg = ((artist.artistProfile.rating * num) - prevRating + rating)/num;
    }
    // Round to 2 places
    avg = parseFloat(avg.toFixed(2));


    // Perform the update operation
    const updatedArtist = await userCollection.updateOne(
        { _id: new ObjectId(aid) },
        {
            $set: {
                "artistProfile.reviewsReceived": artist.artistProfile.reviewsReceived,
                "artistProfile.rating": avg,
            },
        }
    );

    if (updatedArtist.matchedCount === 0 || updatedArtist.modifiedCount !== 1) {
        throw `Error: Could not update artist with ID ${aid}.`;
    }
    
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

export const getReviewsByArtistId = async(aid) => {
    aid = checkId(aid);
    const reviewCollection = await reviews();
    const reviewList = await reviewCollection.find({aid: aid}).toArray();
    if (!reviewList) throw `Error: Could not get all reviews.`;
    reviewList = reviewList.map((review) => {
        review._id = review._id.toString(); 
    });
    return reviewList;
}

export const updateCommissionReviewStatus = async (id, hasReview) => {
    id = checkId(id);
    if (typeof hasReview !== "boolean") {
        throw `Error: hasReview must be a boolean!`
    }

    const commissionCollection = await commissions();
    const updateInfo = await commissionCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: {review: hasReview } }
    );

    if (!updateInfo.matchedCount) throw "Commision not found!"
    if (!updateInfo.modifiedCount) throw "Review status was not updated!"

    return await getCommissionById(id);
}
