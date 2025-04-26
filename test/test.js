import testUserMethods from "./user.js";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";

//create database  
const db = await dbConnection();
await db.dropDatabase();

/* add test methods here */ 
await testUserMethods(); 

//close db connection 
await closeConnection(); 
console.log("Finished testing!"); 