import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is not set");
  throw new Error("MONGODB_URI missing - check environment variables in Amplify");
}

console.log("MongoDB URI configured:", uri.substring(0, 50) + "...");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect().catch(error => {
      console.error("MongoDB connection error in development:", error);
      throw error;
    });
  }

  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect().catch(error => {
    console.error("MongoDB connection error in production:", error);
    throw error;
  });
}

export async function getDb() {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db("student-gallery");
  } catch (error) {
    console.error("Failed to get database connection:", error);
    throw new Error("Database connection failed");
  }
}