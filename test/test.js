import testUserMethods from "./user.js";
import testArtistMethods  from "./artist.js";
import testCommissionsMethods from "./commission.js";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import testReviewMethods from "./review.js";

//create database  
const db = await dbConnection();
await db.dropDatabase();

/* add test methods here in order of dependency*/ 
await testUserMethods(); 
await testArtistMethods();
let commissionList = await testCommissionsMethods(); 
await testReviewMethods(commissionList); 

//close db connection 
await closeConnection(); 
console.log("Finished testing!"); 