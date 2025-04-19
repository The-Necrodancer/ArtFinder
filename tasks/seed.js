/**
 * Populate the MongoDb database with user data and accounts based on our database schema.
 * quickly seed the database with some initial data for testing purposes.
 */

import { dbConnection, closeConnection } from "./config/mongoConnection.js";
//TODO: Import the data model you want to seed the database with

const db = await dbConnection();

await db.dropDatabase(); // Drop the database if it exists
console.log("Database dropped successfully!");

