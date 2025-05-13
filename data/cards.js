import { ObjectId } from "mongodb";
import {
    checkBio,
  checkName,
  checkRating,
  checkSocialsLinks,
  checkTos,
  throwWrongTypeError,
} from "../helpers.js";
import { getUserById } from "./users.js";
import { cards } from "../config/mongoCollection.js";
import { artistProfileKeys } from "./artists.js";
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
    }
*/
export const cardKeys = ['name', 'socialsLinks',  'artistProfile']; 
export const cardArtistProfileKeys = ['availability', 'bio', 'tos', 'rating', 'portfolio'];
export const filterKeys = ['priceRange', 'tags', 'isOfficial', 'rating', 'availability'];  
//min max 

export const nameMinLength = 4;
export const nameMaxLength = 32;

export const socialMediaSites = [
  "YouTube",
  "Facebook",
  "Instagram",
  "TikTok",
  "X",
  "DeviantArt",
  "ArtStation",
  "Threads",
  "BlueSky",
  "Pillowfort",
  "Newgrounds",
  "Unvale",
  "Tumblr"
];

export const createCard = async (
  name,
  socialsLinks,
  tags,
  isUserRecommended,
  uid
) => {
  name = checkName(name);
  socialsLinks = checkSocialsLinks(socialsLinks);
  if (!Array.isArray(tags))
    throwWrongTypeError("artist tags", "Array", typeof tags);
  if (typeof isUserRecommended !== "boolean")
    throwWrongTypeError(
      "is-user-recommended",
      "boolean",
      typeof isUserRecommended
    );
  let newCard = {
    name,
    socialsLinks,
    tags,
    isUserRecommended,
  };

  if (isUserRecommended) {
    await getUserById(uid);
    newCard.uid = uid.trim();
  } else {
    const artist = await getArtistById(uid);
    newCard.uid = uid.trim();
    newCard.artistProfile = {
      availability: artist.artistProfile.availability,
      bio: artist.artistProfile.bio,
      tos: artist.artistProfile.tos,
      rating: artist.artistProfile.rating,
      modifiableByUsers: true,
    };
  }

  let cardCollection = await cards();
  const insertedCard = await cardCollection.insertOne(newCard);
  if (insertedCard.acknowledged != true || !insertedCard.insertedId) {
    throw `Error: could not create user ${username}.`;
  }
  return insertedCard.insertedId.toString();
};

export const getCardById = async (caid) => {
  caid = checkId(caid);
  const cardCollection = await cards();
  const card = await cardCollection.findOne({ _id: new ObjectId(caid) });
  if (!card) throw `Error: card not found.`;
  card._id = card._id.toString();
  return card;
};

export const getAllCards = async () => {
  const cardCollection = await cards();
  let cardList = await cardCollection.find({}).toArray();
  if (!cardList) throw "Error: Could not get all cards.";
  cardList = cardList.map((card) => {
    card._id = card._id.toString();
    return card;
  });
  return cardList;
};

export const getNewestCards = async () => {
  let maxElements = 50;
  let cardCollection = await cards();
  //https://stackoverflow.com/questions/13847766/how-to-sort-a-collection-by-date-in-mongodb
  let cardList = await cardCollection.find({}).sort({ _id: -1 });
  if (cardList.length > 50) {
    cardList = cardList.slice(0, maxElements);
  }
  return cardList;
};

export const updateCardById = async(cid, updates) => {
    cid = checkId(cid); 
    if(!updates || typeof updates !== 'object') 
        throwWrongTypeError('card updates', 'Object', typeof updates); 
    if(updates.constructor !== Object) 
        throwWrongTypeError('card updates', 'Object', String(updates.constructor)); 
    if(Object.keys(updates).length<1)
        throw 'Error: at least one update field must be provided.'; 
    for(const key of Object.keys(updates)) {
        if(!cardKeys.includes(key)) {
            throw `Error: ${key} is not a valid profile key`;
        }
    }
    let validatedObj = {}
    if('name' in updates) 
        validatedObj.name = checkName(updates.name); 
    if('socialsLinks' in updates) 
        validatedObj.socialsLinks = checkSocialsLinks(updates.socialsLinks); 
    if('artistProfile' in updates) {
        if(!updates.artistProfile || typeof updates.artistProfile !== 'object') 
            throwWrongTypeError('card updates artist profile', 'Object', typeof updates); 
        if(updates.artistProfile.constructor !== Object) 
            throwWrongTypeError('card updates artist profile', 'Object', String(updates.constructor)); 
        if(Object.keys(updates.artistProfile).length<1)
            throw 'Error: at least one artist profile field must be provided.'; 
        for(const key of Object.key(updates.artistProfile)) 
            if(! cardArtistProfileKeys.includes(key)) 
                throw `Error: artistProfile.${key} is not a valid update field for cards.`
        if('portfolio' in updates.artistProfile) {
            //check portfolio 
        }
        if('availability' in updates.artistProfile) {
            if (typeof updates.artistProfile.availability !== 'boolean') 
                throwWrongTypeError("artist card's availability", 'boolean', typeof updates.artistProfile.availability); 
        }
        if('bio' in updates.artistProfile) 
            validatedObj["artistProfile.bio"] = checkBio(updates.artistProfile.bio) 
        if('tos' in updates.artistProfile) 
            validatedObj["artistProfile.tos"] = checkTos(updates.artistProfile.tos) 
        if('rating' in updates.artistProfile) 
            validatedObj["artistProfile.rating"] = checkRating(updates.artistProfile.rating) 
    }
    let cardCollection = await cards(); 
        const updatedCard = await cardCollection.findOneAndUpdate(
            {_id: new ObjectId(aid)}, 
            {$set: validatedObj},
            {returnDocument: "after"}
        ); 
        if(!updatedCard) throw 'Error: no card exists with given id.'; 
        updatedArtist._id = updatedArtist._id.toString(); 
        delete updatedArtist.password;
        return updatedArtist; 
}

export const filterCards = async(filters) => {
    if(!filters || typeof filters !== 'object')
        throwWrongTypeError("card filters", 'Object', typeof filters)
    if(filters.constructor !== Object)
        throwWrongTypeError("card filters", "Object", String(filters.constructor)); 
    if(Object.keys(filters).length<1)   
        throw `Error: at least one filter must be provided.`; 
    for(const key of Objeect.keys(filters)) 
        if(!filterKeys.includes(key))
            throw `Error: ${key} is not a valid filter key.`; 
    if('tags' in filters) {
        //if(tags)
    }
}