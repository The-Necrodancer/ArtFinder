import { artistProfileKeys, getAllArtists, getArtistById, updateArtistProfile } from "../data/artists.js";
import { getAllUsers } from "../data/users.js";
import { ObjectId } from "mongodb";
import lodash from 'lodash'; 
import { createRandomArtistProfile } from "./helper.js";
export const testArtistMethods = async() => {
    let artistList = await testGetAllArtists(); 
    await testGetArtistById(artistList); 
    await testUpdateArtistProfile(artistList); 
    await testGetArtistByIdBadInput(); 
    await testUpdateArtistProfileBadInput(artistList[0]._id);
}

const testGetAllArtists = async() => {
    const userList = await getAllUsers(); 
    const artistList = await getAllArtists(); 
    let hasErrors = false; 

    for(const user of userList) {
        if(user.role === 'artist' && !artistList.find((obj) => obj._id === user._id)) {
            hasErrors = true; 
            console.log('ERROR: artist ', user, 'was not returned by getAllArtists'); 
        }
    }
    if(!hasErrors) console.log("getAllArists passed its test case!"); 
    return artistList; 
}

const testGetArtistById = async(artistList) => {
    let hasErrors = false; 
    for(const artist of artistList) {
        try {
            const returnedArtist = await getArtistById(artist._id); 
            if(!lodash.isMatch(artist, returnedArtist)) {
                hasErrors = true; 
                console.log("FALIURE IN getArtistById");
                console.log("Attempted to get artist ", artist); 
                console.log("Received ", returnedArtist); 
            }
        } catch (e) {
            console.log("FALIURE IN getArtistById");
            console.log("Attempted to get artist ", artist); 
            console.log("Received error ", e); 
        }
    }
    if(!hasErrors) {
        console.log("getArtistById passed all test cases.")
    }
}

const testUpdateArtistProfile = async(artistList) => {
    let hasErrors = false; 
    //updates every artist 
    for(const artist of artistList) {
        let aid = artist._id; 
        let profileUpdates = createRandomArtistProfile(); 
        let updatedArtist = await updateArtistProfile(aid, profileUpdates); 
        //makes sure that all fields that were supposed to be updated were updated correctly 
        //and that all fields that weren't supposed to be updated weren't changed 
        for(const key of artistProfileKeys) {
            if (key in profileUpdates) { //if artistProfile.key was supposed to be updated 
                if(compareArtistProfileHelper(updatedArtist.artistProfile, profileUpdates, key)) { //if it wasn't updated correctly
                    hasErrors = true; 
                    console.log("FAILURE IN updateArtistProfile"); 
                    console.log("Key with error (update): ", key); 
                    console.log("to change: ",  profileUpdates[key]);
                    console.log("Before: ", artist.artistProfile[key]); 
                    console.log("After: ", updatedArtist.artistProfile[key]); 
                }
            } else if (compareArtistProfileHelper(artist.artistProfile, updatedArtist.artistProfile, key)){
                console.log("FAILURE IN updateArtistProfile"); 
                console.log("Key with error (no update): ", key); 
                console.log("Before: ", artist.artistProfile[key]); 
                console.log("After: ", updatedArtist.artistProfile[key]); 
            }
        }
    }
    if(!hasErrors) console.log('updateArtistProfile successfully passed all test cases.'); 
}

const compareArtistProfileHelper = (p1, p2, key) => {
    if(p1[key] === undefined || p2[key] === undefined) {
        throw `Error: undefined at ${key}.`
    }

    if (Array.isArray(p1[key]) && Array.isArray(p2[key])) {
        return (p1[key].length !== p2[key].length) || !(p1[key].every((e, i) => e == p2[key][i])); 
    }
    
    if (p1[key].constructor === Object && p2[key].constructor === Object) {
        return !lodash.isMatch(p1[key], p2[key]);
    }

    if(typeof p1[key] === 'number' && typeof p2[key] === 'number') {
        return p1[key] !== p2[key]; 
    }    

    if(typeof p1[key] === 'string' && typeof p2[key]==='string') {
        return p1[key] !== p2[key]; 
    }

    return p1[key] !== p2[key];
}

const testGetArtistByIdBadInput = async() => {
    let hasErrors = false; 
    const badInputs = [
        undefined, 
        null, 
        '    ', 
        3, 
        ['id'], 
        {}, 
        'wedtysghcbj', 
        new ObjectId()
    ]
    for(let i=0; i<badInputs.length; i++) {
        try {
            await getArtistById(badInputs[i]); 
            hasErrors = true; 
            console.log("getArtistById failed to throw for input ", badInputs[i]); 
        } catch (e) {}
    }
    if(!hasErrors) console.log("getArtistById successfuly threw for all bad input test cases."); 
}

const testUpdateArtistProfileBadInput = async(aid) => {
    let hasErrors = false; 
    const badInputs = [
        [undefined, {bio: "HELLO :("}], 
        [3, {bio: "HELLO :("}], 
        [new ObjectId(), {bio: "HELLO :("}], 
        [aid, undefined], 
        [aid, "HELLO"], 
        [aid, {}], 
        [aid, {bio: undefined}], 
        [aid, {bio: 4}], 
        [aid, {portfolio: undefined}], 
        [aid, {pricingInfo: undefined}],
        [aid, {pricingInfo: [6, 9, 10]}],
        [aid, {pricingInfo: {'small sketch': 60.009}}],
        [aid, {tags:{}}],
        [aid, {tags:{hello: 'gerjfdv'}}],
        [aid, {availability: undefined}],
        [aid, {availability: 9}],
        [aid, {tos: undefined}],
        [aid, {tos: ["tos"]}]
    ]; 
    for(let i=0; i<badInputs.length; i++) {
        try { 
            await updateArtistProfile(...badInputs[i]); 
            hasErrors = true; 
            console.log("Failed to throw for inputs ", badInputs[i]); 
        } catch (e) {
            if(!e) {
                hasErrors = true; 
                console.log("Inproper error message for ", badInputs[i]); 
            }
        }
    }
    if(!hasErrors) console.log("updateArtistProfile successfully threw for all bad input test cases.");

}
export default testArtistMethods; 