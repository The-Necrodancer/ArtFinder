import { ObjectId } from "mongodb";
import { commissions, users } from '../config/mongoCollection.js';
import { getArtistById } from "./artists.js";
import { getUserById } from "./users.js";
import { checkDetails, checkPriceValue, checkId, checkTitle } from "../helpers.js";

export const titleMinLength = 5; 
export const titleMaxLength = 128; 

export const detailsMinLength = 32; 
export const detailsMaxLength = 1024; 
/*
aid 
uid 
title 
details 
price
status 
dateCreated
progress updates 
    {data, message, }
*/

export const statusValues = ['Pending', 'In Progress', 'Completed', 'Cancelled']; 

export const createCommission = async(
    aid, 
    uid, 
    title, 
    details,
    price
) => {    
    let artist = await getArtistById(aid); 
    let user = await getUserById(uid); 
    title = checkTitle(title); 
    details = checkDetails(details); 
    price = checkPriceValue(price); 
    let status = "Pending"; 
    let dateCreated = new Date().toLocaleDateString(); 
    let progressUpdates = []; 

    let commissionCollection = await commissions(); 
    let insertedCommission = await commissionCollection.insertOne({aid, uid, title, details, price, status, dateCreated, progressUpdates}); 
    if(insertedCommission.acknowledged!=true || !insertedCommission.insertedId) 
        throw `Error: could not insert commission in database`; 

    let cid = insertedCommission.insertedId.toString(); 
    let userCollection = await users(); 
    artist.artistProfile.createdCommissions.push(cid); 
    const updatedArtist = await userCollection.updateOne(
        {_id: new ObjectId(aid)}, 
        {$set: {"artistProfile.createdCommissions": artist.artistProfile.createdCommissions}}
    ); 
    if(updatedArtist.matchedCount ===0 || updatedArtist.modifiedCount !== 1){
        throw `Error: could not add commission to artist.`; 
    }
    user.requestedCommissions.push(cid); 
    const updatedUser = await userCollection.updateOne(
        {_id: new ObjectId(uid)},
        {$set: {"requestedCommissions": user.requestedCommissions}}
    );
    if(updatedUser.matchedCount ===0 || updatedUser.modifiedCount !== 1)
        throw `Error: could not add requested commission to user.`; 

    return await getCommissionById(insertedCommission.insertedId.toString()); 
}

export const getCommissionById = async(id) => {
    id = checkId(id); 
    const commissionCollection = await commissions(); 
    const commission = await commissionCollection.findOne({_id: new ObjectId(id)}); 
    if (!commission) throw `Error: commission not found.`; 
    commission._id = commission._id.toString(); 
    return commission; 
}