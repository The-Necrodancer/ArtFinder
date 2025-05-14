import { faker } from "@faker-js/faker";
import { createCommission } from "../data/commissions.js";
import { getAllArtists, getArtistById, priceMaxValue, priceMinValue } from "../data/artists.js";
import lodash from 'lodash'; 
import { getAllUsers, getUserById } from "../data/users.js";
import { ObjectId } from "mongodb";
const numSuccessTests = 30; 
const testCommissionsMethods = async() => {
    let userList = await getAllUsers(); 
    let artistList = await getAllArtists(); 
    let commissionList = await testCreateCommission(userList, artistList); 
    await testCreateCommissionBadInput(userList[0]._id, artistList[0]._id); 
    return commissionList; 
}

const testCreateCommission = async(userList, artistList) => {
    let hasErrors = false; 
    let createdCommissions = []; 
    for(let i=0; i<numSuccessTests; i++) {
        let aid = artistList[faker.number.int(artistList.length -1)]._id; 
        let uid = userList[faker.number.int(userList.length -1)]._id; 
        let commission = {
            aid, 
            uid, 
            title: faker.commerce.productName(), 
            details: faker.lorem.words(faker.number.int({min: 20, max: 50})), 
            price: Number(faker.commerce.price({min: priceMinValue, max: priceMaxValue}))
        }; 
        let insertedCommission = await createCommission(
            commission.aid, 
            commission.uid, 
            commission.title, 
            commission.details, 
            commission.price
        ); 
        commission._id = insertedCommission._id; 
        commission.status = insertedCommission.status; 
        commission.dateCreated = insertedCommission.dateCreated; 
        commission.progressUpdates = insertedCommission.progressUpdates; 
        commission.reviewed = false; 
        if(! lodash.isMatch(commission, insertedCommission)) {
            hasErrors = true; 
            console.log("ERROR IN createCommission"); 
            console.log("Commission to be added: ", commission); 
            console.log("Inserted commission: ", insertedCommission); 
        } else {
            let hasErrorThisTime = false; 
            if(!(await getUserById(uid)).requestedCommissions.includes(insertedCommission._id)) {
                hasErrorThisTime=true; 
                console.log("ERROR IN createCommission: "); 
                console.log("User missing commission");  
            } if (!(await getArtistById(aid)).artistProfile.createdCommissions.includes(insertedCommission._id)) {
                hasErrorThisTime =  true; 
                console.log("ERROR IN createCommission: "); 
                console.log("User missing commission");  
            }
            if(!hasErrorThisTime)
                createdCommissions.push(insertedCommission); 
        }
    }
    if(!hasErrors) console.log('createCommissions passed all test cases.'); 
    return createdCommissions; 
}

/*

    aid, 
    uid, 
    title, 
    details,
    price

    */
const testCreateCommissionBadInput = async(uid, aid) => {
    let hasErrors = false; 
    const badInputs = [
        [undefined, uid, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [9, uid, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [new ObjectId(), uid, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [aid, undefined, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [undefined, {uid}, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [undefined, new ObjectId(), 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [undefined, uid, undefined, 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [undefined, uid, 10, 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [undefined, uid, {title: 'Red Water Color Robin'}, 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20], 
        [aid, uid, 'Red Watercolor Robin', undefined, 20], 
        [undefined, uid, 'Red Watercolor Robin', 'jhbmn' , 20], 
        [undefined, uid, 'Red Watercolor Robin', 3456 , 20], 
        [aid, uid, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', undefined], 
        [aid, uid, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', '20.5'], 
        [aid, uid, 'Red Watercolor Robin', 'A red robin on a 8x8in heavy-weight paper sitting on a branch of a Japanese cherry blossom.', 20.555]
    ]

    for(let i=0; i<badInputs.length; i++) {
        try {
            await createCommission(...badInputs[i]); 
            hasErrors=true; 
            console.log('Failed to throw for inputs ', badInputs[i]); 
        } catch (e) {
            if(!e) {
                hasErrors = true; 
                console.log('Exception was not thrown for inputs ', badInputs[i]);
            }
        }
    }
    if(!hasErrors) console.log('createCommission successfully threw for all bad inputs.'); 
}

export default testCommissionsMethods; 