/**
 * Populate the MongoDb database with user data and accounts based on our database schema.
 * Quickly seed the database with some initial data for testing purposes.
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { createUser } from "../data/users.js";
import { updateArtistProfile } from "../data/artists.js";

const db = await dbConnection();

await db.dropDatabase(); // Drop the database if it exists
console.log("Database dropped successfully!");

// Create admin user
const admin = await createUser(
  "admin",
  "admin",
  "admin@artfinder.com",
  "Admin123!"
);
console.log("Admin user created successfully");

// Create regular users
const users = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: "JohnDoe123!",
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "JaneSmith123!",
  },
  {
    username: "sarah_wilson",
    email: "sarah@example.com",
    password: "SarahWilson123!",
  },
];

for (const user of users) {
  await createUser("user", user.username, user.email, user.password);
}
console.log("Regular users created successfully");

// Create artist users with profiles
const artists = [
  {
    username: "pablo_picasso",
    email: "pablo@artfinder.com",
    password: "Pablo123!",
    bio: "Modern art pioneer specializing in cubism and abstract expressionism",
    styles: ["Cubism", "Abstract", "Modern"],
    priceRange: {
      min: 50,
      max: 150,
    },
  },
  {
    username: "vincent_artist",
    email: "vincent@artfinder.com",
    password: "Vincent123!",
    bio: "Digital artist specializing in fantasy and sci-fi illustrations",
    styles: ["Digital", "Fantasy", "Sci-Fi"],
    priceRange: {
      min: 20,
      max: 100,
    },
  },
  {
    username: "frida_creates",
    email: "frida@artfinder.com",
    password: "Frida123!",
    bio: "Contemporary artist focusing on portraits and surrealism",
    styles: ["Portrait", "Surrealism", "Contemporary"],
    priceRange: {
      min: 30,
      max: 120,
    },
  },
];

for (const artist of artists) {
  try {
    // First create the user account
    const userId = await createUser(
      "artist",
      artist.username,
      artist.email,
      artist.password
    );

    // Then create the artist profile
    await updateArtistProfile(userId, {
      bio: artist.bio,
      tags: artist.styles,
      pricingInfo: {
        "Quick Sketch": artist.priceRange.min,
        "Full Color": Math.floor(artist.priceRange.min * 2),
        "Complex Piece": artist.priceRange.max,
      },
      portfolio: [], // Portfolio will be empty initially
      availability: true,
      tos: `Terms of Service for ${artist.username}:
1. 50% payment required upfront
2. Delivery time: 2-3 weeks
3. Two rounds of revisions included
4. Commercial rights negotiable
5. Regular updates on progress`,
    });
    console.log(`Created artist profile for ${artist.username}`);
  } catch (e) {
    console.error(`Failed to create artist ${artist.username}:`, e);
  }
}
console.log("Artists created successfully");

console.log("Database seeded successfully!");
await closeConnection();
