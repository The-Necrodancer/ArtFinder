import {faker} from '@faker-js/faker'; 
import bcrypt from 'bcrypt';
import { priceMaxValue, priceMinValue, possibleTagsList } from '../data/artists.js';
import { generateUsername } from "unique-username-generator";
import { usernameMaxLength } from '../data/users.js';
import { createCard, socialMediaSites } from '../data/cards.js';

const exampleProfiles = {
  Facebook: [
    "https://facebook.com/artist.name",
    "https://facebook.com/creative.person",
    "https://facebook.com/profile.php?id=123456789"
  ],
  Instagram: [
    "https://instagram.com/artist_name",
    "https://instagram.com/creativeperson123",
    "https://instagram.com/the.art.of.alex"
  ],
  X: [
    "https://twitter.com/artbyjules",
    "https://x.com/illustrator_ray",
    "https://twitter.com/design.wizard"
  ],
  DeviantArt: [
    "https://www.deviantart.com/darkillustrator",
    "https://deviantart.com/fantasy_art_queen",
    "https://www.deviantart.com/the-ink-master"
  ],
  ArtStation: [
    "https://artstation.com/jane_doe",
    "https://artstation.com/visualsbyjohn",
    "https://artstation.com/kawaii.illustrator"
  ],
  Threads: [
    "https://threads.net/@creativegal",
    "https://threads.net/@doodle_daily",
    "https://threads.net/@artsy.alex"
  ],
  BlueSky: [
    "https://bsky.app/profile/jaydraws.bsky.social",
    "https://bsky.app/profile/linaart.com",
    "https://bsky.app/profile/sketchlord.bsky.social"
  ],
  Pillowfort: [
    "https://pillowfort.social/softsketches",
    "https://pillowfort.social/mysticmaker",
    "https://.pillowfort.social/painterperson"
  ],
  Newgrounds: [
    "https://artistname.newgrounds.com",
    "https://newgrounds.com/portal/view/892134",
    "https://newgrounds.com/user/space_drawer"
  ],
  Unvale: [
    "https://unvale.net/u/digitalbrush",
    "https://unvale.net/u/skywalker.art",
    "https://unvale.net/u/inkninja"
  ],
  Tumblr: [
    "https://creativewolf.tumblr.com",
    "https://tumblr.com/blog/cosmicillustrator",
    "https://tumblr.com/artjunkie"
  ]
};

const imgLinks = [
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747175758/signed_upload_demo_uw/tbucdp5ac88nspwuh1c0.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747175742/signed_upload_demo_uw/rh0edwnizwhvw66qjwn2.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747175492/signed_upload_demo_uw/ywumkqr0woc0qfpi5zkm.png', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747166976/signed_upload_demo_uw/pdhrhwnpy01xyisvdk0b.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747166771/signed_upload_demo_uw/m3erxpavrwpt5lm5tce9.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747164703/signed_upload_demo_uw/lbvpksdueosu7kznuhwc.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747164182/signed_upload_demo_uw/vzzigw0zewdulf8zjjz0.png', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747161968/signed_upload_demo_uw/ttvr0g6ofrbnek9qoee3.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747157941/signed_upload_demo_uw/cgy22vcuyyq8smygt4ao.jpg', 
    'https://res.cloudinary.com/dbozj84g9/image/upload/v1747156274/signed_upload_demo_uw/xrmnzvbygjbl2sz1iadt.png'
]

/**
 * 
 * @returns A randomly generated user obj that can be added to the database. 
 */
export const createRandomUser = async() => {
    let username = generateUsername("_", 3, usernameMaxLength-1 ); 
    while(username.match(/-/)) 
        username = generateUsername("_", 3, usernameMaxLength-1 ); 
    return {
        role: faker.helpers.arrayElement(['user', 'artist', 'admin']),
        username, 
        email: faker.internet.email(),
        password: await bcrypt.hash(faker.internet.password(), 10)  
    }
}

/**
 * 
 * @returns Randomly generated artistProfile to be used for testing. 
 */
export const createRandomArtistProfile = () => {
    let profileObj = {}; 

    //maybe randomly generate pricing info
    const numItems = faker.number.int({min: 1, max: 10}); 

    profileObj.pricingInfo = {}; 
    for(let i=0; i<numItems; i++) {
        profileObj.pricingInfo[faker.commerce.productName()] = Number(faker.commerce.price({min: priceMinValue, max:priceMaxValue})); 
    }

    
    //maybe randomly generate a bio

    profileObj.bio = faker.person.bio(); 


    //maybe randomly generate tags 
    const numTags = faker.number.int({min: 1, max: 10}); 
    profileObj.tags = []; 
    while(profileObj.tags.length < numTags) {
        let tag = faker.helpers.arrayElement(possibleTagsList); 
        if(!profileObj.tags.includes(tag))
            profileObj.tags.push(tag); 
    }

    //maybe randomly generates availability 
    if(faker.number.int({min:0, max:1})) {
        profileObj.availability = faker.number.int() % 2 === 0; 
    }

    //maybe randomly generates tos 
    profileObj.tos = faker.word.words({min: 10, max: 50}); 

    const numArt = faker.number.int({min:0, max:5}); 
    profileObj.portfolio = []; 
    while(profileObj.portfolio.length < numArt) {
        let imgUrl = faker.helpers.arrayElement(imgLinks); 
        if(!profileObj.portfolio.includes(imgUrl))
            profileObj.portfolio.push(imgUrl); 
    }

    return profileObj; 
}

export const createRandomCard = async(userList) => {
    let name = faker.person.firstName(); 
    let numSocialSites = faker.number.int({min: 1, max: 4}); 
    let socialSites = []; 
    while(socialSites.length < numSocialSites) {
        let toAdd = faker.helpers.arrayElement(socialMediaSites); 
        if(!socialSites.includes(toAdd))
            socialSites.push(toAdd); 
    }

    let socialsLinks = []; 

    for(const site of socialSites) {
        socialsLinks.push({
            site, 
            url: faker.helpers.arrayElement(exampleProfiles[site])
        }); 
    }

    const numTags = faker.number.int({min: 1, max: 10}); 
    let tags = []; 
    while(tags.length < numTags) {
        let tag = faker.helpers.arrayElement(possibleTagsList); 
        if(!tags.includes(tag)) 
            tags.push(tag); 
    }
    let uid = faker.helpers.arrayElement(userList)._id; 
    let createdCard = await createCard(name, socialsLinks, tags, true, uid); 
    return createdCard;
}


export const generateRandomData = async() => {

    const numUsers = 200; 
    const numCommissions = 50; 
    const numUserCards = 50; 

    //creates a bunch of users 
    for(let i=0; i<numUsers; i++)  {
        let newUser = await createRandomUser(); 
        await createUser(newUser.role, newUser.username, newUser.email, newUser.password); 
    }


    //creates a bunch of artists
    let artistList = await getAllArtists(); 
    for(let artist of artistList) {
        let aid = artist._id; 
        let profileUpdates = createRandomArtistProfile(); 
        await updateArtistProfile(aid, profileUpdates); 
    }

    //creates a bunch of commissions 

    let userList = await getAllUsers(); 
    let commissionList = []; 
    for(let i=0; i< numCommissions; i++){
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
        commissionList.push(insertedCommission);
    }

    //creates a bunch of reviews
    let reviewList = []; 
    for(let i=0; i<commissionList.length; i++) {
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
        reviewList.push(insertedReview); 
    }

    for(let i=0; i<numUserCards; i++) {
        await createRandomCard(); 
    }
}