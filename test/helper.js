import {faker} from '@faker-js/faker'; 
import bcrypt from 'bcrypt';
import { priceMaxValue, priceMinValue } from '../data/artists';

/**
 * 
 * @returns A randomly generated user obj that can be added to the database. 
 */
export const createRandomUser = async() => {
    return {
        role: faker.helpers.arrayElement(['user', 'artist', 'admin']),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: await bcrypt.hash(faker.internet.password(), 10)  
    }
}

/**
 * 
 * @returns Randomly generated artistProfile to be used for testing. 
 */
export const createRandomArtistProfile = async() => {
    let profileObj = {}; 

    //maybe randomly generate pricing info
    const numItems = faker.number.int({min: 0, max: 10}); 
    if(numItems) {
        profileObj.pricingInfo = {}; 
        for(let i=0; i<numItems; i++) {
            profileObj.pricingInfo[faker.commerce.productName()] = Number(faker.commerce.price({min: priceMinValue, max:priceMaxValue})); 
        }
    }
    
    //maybe randomly generate a bio
    if(faker.number.int({min:0, max:1})) {
        profileObj.bio = faker.person.bio(); 
    }

    //maybe randomly generate tags 
    const numTags = faker.number.int({min: 0, max: 10}); 
    if(numTags) {
        profileObj.tags = []; 
        for(let i=0; i<numTags; i++) {
            profileObj.tags.push(faker.word.adjective());  
        }
    }

    //maybe randomly generates availability 
    if(faker.number.int({min:0, max:1})) {
        profileObj.availability = faker.number.int() % 2 === 0; 
    }

    //maybe randomly generates tos 
    if(faker.number.int({min:0, max:1})) { 
        profileObj.tos = faker.word.words({min: 10, max: 50}); 
    }
    return profileObj; 
}