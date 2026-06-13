import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

// Cache on the global object so it survives across hot reloads and serverless invocations
const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClient) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // fail fast instead of hanging
    connectTimeoutMS: 10000,
  });
  globalWithMongo._mongoClient = client.connect();
}

export async function getDb() {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = await globalWithMongo._mongoClient!;
  return client.db("student-gallery");
}