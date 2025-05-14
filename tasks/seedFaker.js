/**
 * Populate the MongoDb database with user data and accounts based on our database schema.
 * quickly seed the database with some initial data for testing purposes.
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { createUser } from "../data/users.js";
import { faker } from "@faker-js/faker";

const NUM_ADMINS = 10;
const NUM_USERS = 100;
const NUM_ARTISTS = 50;

const seed = async () => {
  const db = await dbConnection();
  await db.dropDatabase();
  console.log("Database dropped successfully!");

  // Create Admin Users
  for (let i = 0; i < NUM_ADMINS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = "Admin@123";

    try {
      await createUser("admin", username, email, password);
      console.log(`Admin created: ${username}`);
    } catch (e) {
      console.error(`Error creating admin ${username}:`, e);
    }
  }

  // Create Regular Users
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
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
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = "Artist@123";

    try {
      await createUser("artist", username, email, password);
      console.log(`Artist created: ${username}`);
    } catch (e) {
      console.error(`Error creating artist ${username}:`, e);
    }
  }

  console.log("All users seeded successfully!");
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