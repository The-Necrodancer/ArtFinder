/**
 * Populate the MongoDb database with user data and accounts based on our database schema.
 * quickly seed the database with some initial data for testing purposes.
 */
import { generateUsername } from "unique-username-generator";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { createUser, getAllUsers } from "../data/users.js";
import { faker } from "@faker-js/faker";
import { usernameMaxLength } from "../data/users.js";
import { getAllArtists, priceMaxValue, priceMinValue, updateArtistProfile } from "../data/artists.js";
import { createCommission } from "../data/commissions.js";
import { createRandomArtistProfile, createRandomCard } from "../test/helper.js";
import { getCardById } from "../data/cards.js";
import { createReview } from "../data/reviews.js";
import { createReport } from "../data/reports.js";
import { createBlog } from "../data/blogs.js";

const NUM_ADMINS = 10;
const NUM_USERS = 100;
const NUM_ARTISTS = 50;
const NUM_COMMISSIONS = 30; 
const NUM_CARDS = 25; 
const NUM_REPORTS = 5; 
const NUM_BLOGS = 5; 

const seed = async () => {
  const db = await dbConnection();
  await db.dropDatabase();
  console.log("Database dropped successfully!");

  // Create Admin Users
   await createUser(
    "admin",
    "admin",
    "admin@artfinder.com",
    "Admin@123" 
  );
  let adminList = []; 
  for (let i = 0; i < NUM_ADMINS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let username = generateUsername("_", 3, usernameMaxLength-1 ); 
    while(username.match(/-/)) 
        username = generateUsername("_", 3, usernameMaxLength-1 ); 
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = "Admin@123";

    try {
      let admin = await createUser("admin", username, email, password);
      adminList.push(admin);
      console.log(`Admin created: ${username}`);
    } catch (e) {
      console.error(`Error creating admin ${username}:`, e);
    }
  }

  // Create Regular Users
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let username = generateUsername("_", 3, usernameMaxLength-1 ); 
    while(username.match(/-/)) 
        username = generateUsername("_", 3, usernameMaxLength-1 ); 
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = "User@123";

    try {
      await createUser("user", username, email, password);
      console.log(`User created: ${username}`);
    } catch (e) {
      console.error(`Error creating user ${username}:`, e);
    }
  }

  // Create Artist Users
  for (let i = 0; i < NUM_ARTISTS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let username = generateUsername("_", 3, usernameMaxLength-1 ); 
    while(username.match(/-/)) 
        username = generateUsername("_", 3, usernameMaxLength-1 ); 
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = "Artist@123";

    try {
      await createUser("artist", username, email, password);
      console.log(`Artist created: ${username}`);
    } catch (e) {
      console.error(`Error creating artist ${username}:`, e);
    }
  }

  let userList = await getAllUsers(); 
  let artistList = await getAllArtists(); 

  for(const artist of artistList) {
    let profileUpdates = createRandomArtistProfile(); 
    try {
      let aid = artist._id; 
      let updatedArtist = await updateArtistProfile(aid, profileUpdates); 
      console.log("artist successfully updated: ", artist.username); 
    } catch (e) {
      console.log("Error updating profile to ", profileUpdates); 
    }
  }
  

  console.log("All users seeded successfully!");


  let commissionList = []; 
  for(let i=0; i< NUM_COMMISSIONS; i++){
      let aid = artistList[faker.number.int(artistList.length -1)]._id; 
      let uid = userList[faker.number.int(userList.length -1)]._id; 
      let commission = {
          aid, 
          uid, 
          title: faker.commerce.productName(), 
          details: faker.lorem.words(faker.number.int({min: 20, max: 50})), 
          price: Number(faker.commerce.price({min: priceMinValue, max: priceMaxValue}))
      }; 
      try {
        let insertedCommission = await createCommission(
            commission.aid, 
            commission.uid, 
            commission.title, 
            commission.details, 
            commission.price
        ); 
        console.log("Commission created: ", insertedCommission.title);
        commissionList.push(insertedCommission); 
      } catch (e) {
        console.log("Error creating commission: ", commission); 
      }
  }

  let reviewList = []; 
    for(let i=0; i<commissionList.length; i++) {
        let review = {
            cid: commissionList[i]._id, 
            rating: faker.number.int({min:1, max:5}), 
            comment: faker.lorem.words({min: 10, max:50})
        }
        let insertedReview;
        try{
          insertedReview = await createReview(
              review.cid, 
              review.rating, 
              review.comment
          ); 
        } catch(e) {
          if(e === "Error: You have already reviewed this artist. Please update your existing review.")
            i--; 
          else
            console.log("Error in creating review: ", e.toString());
        }
        reviewList.push(insertedReview); 
    }

  for(let i=0; i<NUM_CARDS; i++) {
    try {
      let card = await createRandomCard(userList);
      console.log("Successfully created card: ", card); 
    } catch (e) {
      console.log("Error in creating card: ", String(e));
    }
    
  }

  for(let i=0; i<NUM_REPORTS; i++) {
    try {
      let report = await createReport(
      userList[i]._id, 
      artistList[i]._id, 
      faker.lorem.words({min: 10, max:12}),
      faker.lorem.words({min: 30, max:50})
    )
      console.log("Successfully created report: ", report.subject); 
    } catch (e) {
      console.log("Error in creating report: ", String(e));
    }
  }

  for(let i=0; i<NUM_BLOGS; i++) {
    try {
      let blog = await createBlog(
        faker.lorem.words({min: 10, max:12}),
       faker.lorem.words({min: 30, max:50}),
        faker.helpers.arrayElement(adminList)
      )
      console.log("Successfully created blog post: ", blog._id); 
    } catch (e) {
      console.log("Error in creating blog post: ", String(e));
    }
  }


  
  await closeConnection();
};

try {
  await seed();
  console.log("Database seeding complete!");
  process.exit(0);
} catch (e) {
  console.error("Seeding failed:", e);
  process.exit(1);
}