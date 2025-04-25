import testUserMethods from "./user.js";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";

const db = await dbConnection();
await db.dropDatabase();

await testUserMethods(); 

await closeConnection(); 

console.log("Finished testing!"); 