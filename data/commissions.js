import { ObjectId } from "mongodb";
import { commissions } from '../config/mongoCollection.js';
import { getArtistById } from "./artists.js";
import { getUserById } from "./users.js";
import { checkDetails, checkPriceValue, checkStatus, checkTitle } from "../helpers.js";

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
    await getArtistById(aid); 
    await getUserById(uid); 
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