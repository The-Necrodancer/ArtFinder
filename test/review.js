import { faker } from "@faker-js/faker";
import { getArtistById } from "../data/artists.js";
import { getUserById } from "../data/users.js";
import { createReview, getReviewById } from "../data/reviews.js";
import lodash from 'lodash'; 
import { getCardById } from "../data/cards.js";
const testReviewMethods = async(commissionList) => {
    let reviewList = await testCreateReview(commissionList); 
}; 


const testCreateReview = async(commissionList) => {
    let hasErrors = false; 
    let reviewList = []; 
    for(let i=0; i<commissionList.length/2; i++) {
        let review = {
            cid: commissionList[i]._id, 
            rating: faker.number.int({min:1, max:5}), 
            comment: faker.lorem.words({min: 10, max:50})
        }

        let insertedReview = await createReview(
            review.cid, 
            review.rating, 
            review.comment
        ); 

        let artist = await getArtistById(commissionList[i].aid); 
        let user = await getUserById(commissionList[i].uid); 

        review._id = insertedReview._id; 
        review.aid = insertedReview.aid; 
        review.uid = insertedReview.uid; 
        let hasErrorThisTime = false; 
        if(!lodash.isMatch(review, insertedReview)) {
            hasErrors=true; 
            console.log("ERROR IN createReview"); 
            console.log('Tried to insert ', review); 
            console.log('Inserted: ', insertedReview);
            continue; 
        } 
        if(!user.reviewsGiven.includes(insertedReview._id)) {
            console.log('ERROR IN createReview'); 
            console.log('Missing review in user: ', insertedReview); 
            console.log('User is ', user); 
            hasErrors=true; 
            hasErrorThisTime = true; 
        }
        if(!artist.artistProfile.reviewsReceived.includes(insertedReview._id) )  {
            console.log('ERROR IN createReview'); 
            console.log('Missing review in artist: ', insertedReview); 
            console.log('Artist is ', artist);
            hasErrorThisTime = true; 
            hasErrors=true; 
        }
        let sum = 0; 
        let num = 0; 
        for(const rev of artist.artistProfile.reviewsReceived ) {
            sum += (await getReviewById(rev)).rating;  
            num++; 
        }
        let calcedAvg = parseFloat((sum/num).toFixed(2));
        if(artist.artistProfile.rating !== calcedAvg) {
            hasErrorThisTime=true; 
            hasErrors=true; 
            console.log("ERROR IN createReview"); 
            console.log("Artist average was incorrectly calculated"); 
            console.log("Artist has rating ", String(artist.artistProfile.rating), ", but expected rating ", String(calcedAvg)); 
            let ratingArr = []; 
            for(const rev of artist.artistProfile.reviewsReceived ) {
                ratingArr.push((await getReviewById(rev)).rating);
            }
            console.log("Ratings received: ", ratingArr)
        }
        let card = await getCardById(artist.artistProfile.cid); 
        if(card.artistProfile.rating !== calcedAvg ) {
            console.log("Error in create review "); 
            console.log("Card not properly updated"); 
            console.log("Card has rating ", String(card.artistProfile.rating), ", but expected rating ", String(calcedAvg)); 
        }
        if(!hasErrorThisTime) reviewList.push(insertedReview); 
    }
    if(!hasErrors) console.log('Create Review Passed all Test cases!')
    return reviewList; 
}


export default testReviewMethods; 