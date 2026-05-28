/**
 * Seed initial admin user for development
 * Run: npm run seed
 */
import { getDb } from "../app/lib/mongodb";
import { hashPassword } from "../app/lib/authHelpers";

async function seedAdminUser() {
  try {
    const db = await getDb();

    // Check if admin already exists
    const existingAdmin = await db
      .collection("users")
      .findOne({ username: "admin" });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword("admin123");

    const result = await db.collection("users").insertOne({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    });

    console.log("✓ Admin user created:", {
      id: result.insertedId,
      username: "admin",
      role: "admin",
      password: "admin123 (hashed)",
    });

    // Create a test visitor user
    const hashedVisitorPassword = await hashPassword("visitor123");

    const visitorResult = await db.collection("users").insertOne({
      username: "visitor",
      password: hashedVisitorPassword,
      role: "visitor",
      createdAt: new Date(),
    });

    console.log("✓ Visitor user created:", {
      id: visitorResult.insertedId,
      username: "visitor",
      role: "visitor",
      password: "visitor123 (hashed)",
    });

    console.log("\n✓ Seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedAdminUser();
