/**
 * Use this fie to drop your database and create a new one.
 * This is useful for development purposes, but be careful when using it in production.
 */

import { dbConnection, closeConnection } from "./config/mongoConnection.js";
const db = await dbConnection();
await db.dropDatabase();
console.log("Database dropped successfully!");
await closeConnection();
