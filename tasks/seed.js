/**
 * Populate the MongoDb database with user data and accounts based on our database schema.
 * quickly seed the database with some initial data for testing purposes.
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users } from "../config/mongoCollection.js";
import { createUser } from "../data/users.js";
import bcrypt from "bcrypt";

const seedUsers = async () => {
  const db = await dbConnection();
  await db.dropDatabase(); // Drop the database if it exists
  console.log("Database dropped successfully!");

  // Get the users collection to ensure it exists
  const userCollection = await users();

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await createUser(
    "admin",
    "admin",
    "admin@artfinder.com",
    "Admin@123" // bcrypt.hash is handled inside createUser
  );
  console.log("Admin user created");

  // Create some regular users
  await createUser(
    "user",
    "johnsmith",
    "john.smith@email.com",
    "User1@123" // bcrypt.hash is handled inside createUser
  );

  await createUser(
    "user",
    "sarahjones",
    "sarah.jones@email.com",
    "User2@123" // bcrypt.hash is handled inside createUser
  );

  // Create some artist users
  await createUser(
    "artist",
    "artmaster",
    "artmaster@email.com",
    "Artist1@123" // bcrypt.hash is handled inside createUser
  );

  await createUser(
    "artist",
    "creativesoul",
    "creative.soul@email.com",
    "Artist2@123" // bcrypt.hash is handled inside createUser
  );

  console.log("Users seeded successfully!");
  await closeConnection();
};

// Run the seeding function
try {
  await seedUsers();
  console.log("Done!");
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
