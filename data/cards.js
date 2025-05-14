import { ObjectId } from "mongodb";
import {
    checkBio,
  checkName,
  checkRating,
  checkSocialsLinks,
  checkTag,
  checkTos,
  throwWrongTypeError,
  checkId,
  checkImageUrl,
  checkTagList,
checkCardList
} from "../helpers.js";
import { getUserById } from "./users.js";
import { cards } from "../config/mongoCollection.js";
import { getArtistById } from "./artists.js";
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
    numCommissions
    }
*/
export const cardKeys = ['name', 'socialsLinks',  'artistProfile', 'tags']; 
export const cardArtistProfileKeys = ['availability', 'bio', 'tos', 'rating', 'portfolio', 'pricingInfo'];
export const filterKeys = ['priceRange', 'tags', 'rating', 'availability', 'numCommissions'];  
//min max 

export const nameMinLength = 2;
export const nameMaxLength = 32;

export const socialMediaSites = [
  "Facebook",
  "Instagram",
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
  tags = checkTagList(tags);
  if (typeof isUserRecommended !== "boolean")
    throwWrongTypeError(
      "is-user-recommended",
      "boolean",
      typeof isUserRecommended
    );
    socialsLinks = checkSocialsLinks(socialsLinks, isUserRecommended);
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
      pricingInfo: artist.artistProfile.pricingInfo,
      numCommissions: artist.artistProfile.createdCommissions.length
    };
  }

  let cardCollection = await cards();
  const insertedCard = await cardCollection.insertOne(newCard);
  if (insertedCard.acknowledged != true || !insertedCard.insertedId) {
    throw `Error: could not create user.`;
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
    if('tags' in updates) 
        validatedObj.tags = checkTagList(updates.tags);
    if('artistProfile' in updates) {
        validatedObj.artistProfile = {}; 
        if(!updates.artistProfile || typeof updates.artistProfile !== 'object') 
            throwWrongTypeError('card updates artist profile', 'Object', typeof updates); 
        if(updates.artistProfile.constructor !== Object) 
            throwWrongTypeError('card updates artist profile', 'Object', String(updates.constructor)); 
        if(Object.keys(updates.artistProfile).length<1)
            throw 'Error: at least one artist profile field must be provided.'; 
        for(const key of Object.keys(updates.artistProfile)) 
            if(! cardArtistProfileKeys.includes(key)) 
                throw `Error: artistProfile.${key} is not a valid update field for cards.`
        if('portfolio' in updates.artistProfile) {
          validatedObj.artistProfile.portfolio = []; 
          for(let i=0; i<updates.artistProfile.portfolio.length; i++) {
            validatedObj.artistProfile.portfolio.push(checkImageUrl(updates.artistProfile.portfolio[i])); 
          }
        }
        if('pricingInfo' in updates.artistProfile) {
          
          if(!updates.artistProfile.pricingInfo || updates.artistProfile.pricingInfo.constructor !== Object) 
            throwWrongTypeError('pricing info', 'Object', typeof updates.artistProfile.pricingInfo); 
          
          validatedObj.artistProfile.pricingInfo = {}; 
          validatedObj.art
          for(const [key, value] of Object.entries(updates.artistProfile.pricingInfo)) {
            if(Object.keys(validatedObj.artistProfile.pricingInfo).includes(key)) {
              throw `Error: cannot have duplicate keys.`; 
            }
            key = checkPricingInfoItem(key);  
            value = checkPriceValue(value); 
            validatedObj.artistProfile.pricingInfo[key] = value; 
          }
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
            {_id: new ObjectId(cid)}, 
            {$set: validatedObj},
            {returnDocument: "after"}
        ); 
        if(!updatedCard) throw 'Error: no card exists with given id.'; 
        updatedCard._id = updatedCard._id.toString(); 
        return updatedCard; 
};


export const filterCards = async(filters) => {
    if ('name' in filters) {
      cards = cards.filter(card => card.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if(!filters || typeof filters !== 'object')
        throwWrongTypeError("card filters", 'Object', typeof filters)
    if(filters.constructor !== Object)
        throwWrongTypeError("card filters", "Object", String(filters.constructor)); 
    if(Object.keys(filters).length<1)   
        throw `Error: at least one filter must be provided.`; 
    for(const key of Object.keys(filters)) 
        if(!filterKeys.includes(key))
            throw `Error: ${key} is not a valid filter key.`; 
    if('tags' in filters) {
        filters.tags = checkTagList(filters.tags);
    }
    if('priceRange' in filters) {
      if(!filters.priceRange || typeof filters.priceRange !== 'object') 
        throwWrongTypeError("price range", "object", typeof filters.priceRange); 
      if(filters.priceRange.constructor !== Object) 
        throwWrongTypeError("price range", "object", filters.priceRange.constructor); 
      if(Object.keys(filters.priceRange).length<1 || Object.keys(filters.priceRange).length> 2) 
        throw "Error: max price range must either one or two keys."; 
      for(const key of Object.keys(filters.priceRange)) {
        if(key !== 'min' && key !== 'max') 
          throw `Error: ${key} is an unacceptable key value (must be either 'min' or 'max')`; 
        if(typeof filters.priceRange[key] !== 'number') 
          throwWrongTypeError('price', 'number', typeof filters.priceRange[key]); 
        if(filters.priceRange[key] < 0) 
          throw "Error: cannot have negative price"; 
        filters.priceRange[key] = Math.trunc(filters.priceRange[key] * 100) / 100; 
      } 
    }
  if ('numCommissions' in filters) {
    if (!filters.numCommissions || typeof filters.numCommissions !== 'object')
      throwWrongTypeError("numCommissions", "object", typeof filters.numCommissions);
    if (filters.numCommissions.constructor !== Object)
      throwWrongTypeError("numCommissions", "object", filters.numCommissions.constructor);
    const keys = Object.keys(filters.numCommissions);
    if (keys.length < 1 || keys.length > 2)
      throw "Error: numCommissions range must have either one or two keys.";
    for (const key of keys) {
      if (key !== 'min' && key !== 'max')
        throw `Error: ${key} is an unacceptable key value (must be either 'min' or 'max')`;
      if (typeof filters.numCommissions[key] !== 'number')
        throwWrongTypeError('numCommissions', 'number', typeof filters.numCommissions[key]);
      filters.numCommissions[key] = Math.floor(filters.numCommissions[key]); 
      if (filters.numCommissions[key] < 0)
        throw "Error: numCommissions must be zero or a positive integer";
    }
  }
  if('availability' in filters) {
    if(typeof filters.availability !== 'boolean')
      throwWrongTypeError("availability", 'boolean', typeof filters.availability); 
  }

  if('numCommissions' in filters) {

  }

  let isOfficial = ('rating' in filters) || ('priceRange' in filters) || ('availability' in filters); 

  let cards = await getAllCards();
  let result = [];
  for (let card of cards) {
    if(isOfficial) {
      if(card.isUserRecommended) continue; 
      if('priceRange' in filters) {
        let hasMatch = false; 
        for(const price of Object.values(card.artistProfile.pricingInfo)) {
          if((typeof filters.priceRange.min !== 'number' || filters.priceRange.min <= price) 
            && (typeof filters.priceRange.max !== 'number' || filters.priceRange.max >= price)) {
            
            hasMatch = true;  
          }
        }
        if(!hasMatch) continue; 
      }
      if('rating' in filters) {
        if(typeof filters.rating.min === 'number' && card.artistProfile.rating < filters.rating.min )
          continue; 
        if(typeof filters.rating.max === 'number' && card.artistProfile.rating > filters.rating.max )
          continue; 
      }
      if('availability' in filters) {
        if(filters.availability !== card.artistProfile.availability)
          continue; 
      }
      if ('numCommissions' in filters) {
        const commissions = card.artistProfile.numCommissions;

        if (typeof filters.numCommissions.min === 'number' && commissions < filters.numCommissions.min)
          continue;

        if (typeof filters.numCommissions.max === 'number' && commissions > filters.numCommissions.max)
          continue;
      }
    }
    if('tags' in filters) {
        let cardTags = card.tags; 
        if (!filters.tags.every(tag => cardTags.includes(tag))) continue;
      } 
    result.push(card); 
  }
  return result; 
}

/**
 * Gets cards in an ordered list based on rating.
 * @returns {Array} An ordered array of cards by their ratings.
 */
export const getCardsByRating = async (cards ) => {
  if(typeof cards !== 'undefined') 
    cards = checkCardList(cards); 
  else 
    cards = await filterCards({ rating: { min: 0, max: 5 } });
  // Sort cards by rating descending
  cards.sort((a, b) => {
    // Defensive: if artistProfile or rating is missing, treat as 0
    const aRating = a.artistProfile?.rating ?? 0;
    const bRating = b.artistProfile?.rating ?? 0;
    return bRating - aRating;
  });
  return cards;
};


export const getNewestCards = async () => {
  let maxElements = 50;
  let cardCollection = await cards();
  //https://stackoverflow.com/questions/13847766/how-to-sort-a-collection-by-date-in-mongodb
  let cardList = await cardCollection.find({}).sort({ _id: -1 }).toArray();
  if (cardList.length > 50) {
    cardList = cardList.slice(0, maxElements);
  }
  return cardList;
};

/**
 * Gets cards in an ordered list based on rating.
 * @returns {Array} An ordered array of cards by their ratings.
 */
export const getCardsByCommissions = async(cards) => {
    if(typeof cards !== 'undefined') 
      cards = checkCardList(cards);
    else 
      cards = await filterCards({numCommissions: {min: 0}});
    let result = [];
    for (let card of cards) {
        let count = card.artistProfile.numCommissions;
        result.push({
            object: artist,
            numCommissions: count
        });
    }
    result.sort((a, b) => b.numCommissions - a.numCommissions);
    return result; 
}

export const updateCardArtistProfile = async(aid) => {
  let artist = await getArtistById(aid); 
  let newArtistProfile = {
      availability: artist.artistProfile.availability,
      bio: artist.artistProfile.bio,
      tos: artist.artistProfile.tos,
      rating: artist.artistProfile.rating,
      pricingInfo: artist.artistProfile.pricingInfo,
      numCommissions: artist.artistProfile.createdCommissions.length
  };
  let cardCollection = await cards(); 
  const updatedCard = await cardCollection.findOneAndUpdate(
      {_id: new ObjectId(artist.artistProfile.cid)}, 
      {$set: {"artistProfile": newArtistProfile}},
      {returnDocument: "after"}
  ); 
  if(!updatedCard) throw 'Error: no card exists with given id.'; 
  updatedCard._id = updatedCard._id.toString(); 
  return updatedCard;
}


