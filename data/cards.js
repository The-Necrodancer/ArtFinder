import { ObjectId } from "mongodb";
import { 
    checkName, 
    checkSocialsLinks, 
    throwWrongTypeError
} from "../helpers.js";
import { getUserById } from "./users.js";
import { cards } from "../config/mongoCollection.js";
/*
fields: 
-name 
-[ social media links ] //instagram, art station, tiktok, bluesky, etc 
-portfolio
-tags 
-uid
-artistProf 
    {
    availability
    bio
    tos 
    rating 
    modifiableByUsers
    }
*/

export const nameMinLength = 4; 
export const nameMaxLength = 32; 

export const socialMediaSites = [
    'YouTube', 
    'Facebook', 
    'Instagram', 
    'TikTok', 
    'X (Twitter)', 
    'DevianArt', 
    'ArtStation', 
    'Threads', 
    'BlueSky'
]; 

export const createCard = async(
    name, 
    socialsLinks, 
    portfolio, 
    tags, 
    isUserRecommended, 
    uid
) => {
    name = checkName(name); 
    socialsLinks = checkSocialsLinks(socialsLinks); 
    if(!Array.isArray(tags))
        throwWrongTypeError('artist tags', 'Array', typeof tags); 
    if(typeof isUserRecommended !== 'boolean')
        throwWrongTypeError('is-user-recommended', 'boolean', typeof isUserRecommended); 
    let newCard = {
        name, 
        socialsLinks, 
        portfolio, 
        tags, 
        isUserRecommended
    }

    if(isUserRecommended) {
        await getUserById(uid); 
        newCard.uid = id.trim(); 
    } else {
        const artist = await getArtistById(uid); 
        newCard.uid = uid.trim(); 
        newCard.artistProfile = {
            availability: artist.artistProfile.availability, 
            bio: artist.artistProfile.bio, 
            tos: artist.artistProfile.tos, 
            rating: artist.artistProfile.rating, 
            modifiableByUsers: true
        };
    }

    let cardCollection = await cards(); 
    const insertedCard = await cardCollection.insertOne(newCard); 
    if(insertedCard.acknowledged != true || !insertedCard.insertedId) {
        throw `Error: could not create user ${username}.`
    }
    return insertedCard.insertedId.toString(); 
}

export const getCardById = async(caid) => {
    caid = checkId(caid);
    const cardCollection = await cards(); 
    const card = await cardCollection.findOne({_id: new ObjectId(caid)}); 
    if (!card) throw `Error: card not found.`; 
    card._id = card._id.toString(); 
    return card;
}

export const getAllCards = async() => {
    const cardCollection = await cards(); 
    let cardList = await cardCollection.find({}).toArray(); 
    if(!cardList) throw 'Error: Could not get all cards.'; 
    cardList = cardList.map((card) => {
        card._id = card._id.toString(); 
        return card; 
    }); 
    return cardList; 
};

export const getNewestCards = async() => {
    let maxElements = 50; 
    let cardCollection = await cards();
    //https://stackoverflow.com/questions/13847766/how-to-sort-a-collection-by-date-in-mongodb 
    let cardList = await cardCollection.find({}).sort({_id:-1}); 
    if(cardList.length > 50) {
        cardList = cardList.slice(0, maxElements); 
    }
    return cardList; 
}