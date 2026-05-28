import { getDb } from "../app/lib/mongodb";

/**
 * Initialize MongoDB collections for the student gallery app
 * Run this once during setup: node -r ts-node/register scripts/setupDb.ts
 */
export async function setupCollections() {
  try {
    const db = await getDb();

    // Create users collection with indexes
    const collections = await db.listCollections().toArray();
    const usersCollectionExists = collections.some((col) => col.name === "users");

    if (!usersCollectionExists) {
      await db.createCollection("users");
      console.log("✓ Created 'users' collection");

      // Create indexes for users collection
      await db.collection("users").createIndex({ username: 1 }, { unique: true });
      console.log("✓ Created unique index on username");
    } else {
      console.log("✓ 'users' collection already exists");
    }

    // Verify collections
    const allCollections = await db.listCollections().toArray();
    console.log("\nAvailable collections:");
    allCollections.forEach((col) => console.log(`  - ${col.name}`));

    console.log("\n✓ Database setup complete!");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupCollections();
}
